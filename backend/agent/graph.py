"""
FairSign — LangGraph Agent Graph
Two graphs:
1. analysis_graph  — Sequential analysis of a contract (runs once per upload)
2. chat_graph      — ReAct agent with memory for ongoing Q&A
"""

import json
import os
import operator
from typing import TypedDict, Annotated, Optional

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode, tools_condition

from agent.tools import ALL_TOOLS
from agent.prompts import ANALYSIS_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT, PERSONALITY_PROMPTS
from parse_json import extract_json

# ── Auto-selects Groq (free) or OpenAI based on available .env key ──────────
def get_llm(temperature: float = 0.2, model: str = None):
    groq_key = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    if groq_key:
        from langchain_groq import ChatGroq
        groq_model = "llama-3.3-70b-versatile"
        return ChatGroq(model=groq_model, temperature=temperature, api_key=groq_key)
    elif openai_key:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model="gpt-4o", temperature=temperature, api_key=openai_key)
    else:
        raise ValueError("No API key found. Add GROQ_API_KEY or OPENAI_API_KEY to your .env file.")


# ═══════════════════════════════════════════════════════════════════════════
# GRAPH 1: CONTRACT ANALYSIS GRAPH
# ═══════════════════════════════════════════════════════════════════════════

class AnalysisState(TypedDict):
    messages: Annotated[list, operator.add]
    contract_text: str
    market: str
    personality: str
    analysis: Optional[dict]
    error: Optional[str]


def build_analysis_agent_node(state: AnalysisState):
    """Main analysis agent node — uses tools then produces final JSON analysis."""
    llm = get_llm(temperature=0.1).bind_tools(ALL_TOOLS)

    system_content = ANALYSIS_SYSTEM_PROMPT.format(market=state["market"])

    # Add personality modifier
    personality = state.get("personality", "friendly")
    if personality in PERSONALITY_PROMPTS:
        system_content += f"\n\nTONE MODIFIER: {PERSONALITY_PROMPTS[personality]}"

    messages = [SystemMessage(content=system_content)] + state["messages"]
    response = llm.invoke(messages)
    return {"messages": [response]}


def parse_final_analysis(state: AnalysisState):
    """
    After the agent finishes tool calls, extract the final JSON analysis
    from the last AI message.
    """
    messages = state["messages"]

    # Find the last AI message that contains the JSON analysis
    for msg in reversed(messages):
        if isinstance(msg, AIMessage) and msg.content:
            content = msg.content
            # Try to extract JSON from the response
            try:
                # Direct parse
                analysis = json.loads(content)
                return {"analysis": analysis}
            except json.JSONDecodeError:
                # Try to find JSON block in text
                import re
                match = re.search(r'\{[\s\S]*\}', content)
                if match:
                    try:
                        analysis = json.loads(match.group())
                        return {"analysis": analysis}
                    except Exception:
                        pass

    return {"error": "Could not parse analysis from agent response. Please try again."}


def should_continue_analysis(state: AnalysisState):
    """Route: if last message has tool calls, go to tools. Otherwise, parse and finish."""
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return "parse"


# Build the analysis graph
def build_analysis_graph():
    tool_node = ToolNode(ALL_TOOLS)

    graph = StateGraph(AnalysisState)
    graph.add_node("agent", build_analysis_agent_node)
    graph.add_node("tools", tool_node)
    graph.add_node("parse", parse_final_analysis)

    graph.set_entry_point("agent")
    graph.add_conditional_edges(
        "agent",
        should_continue_analysis,
        {"tools": "tools", "parse": "parse"}
    )
    graph.add_edge("tools", "agent")
  

    return graph.compile()


# ═══════════════════════════════════════════════════════════════════════════
# GRAPH 2: CHAT GRAPH (with memory)
# ═══════════════════════════════════════════════════════════════════════════

class ChatState(TypedDict):
    messages: Annotated[list, operator.add]
    contract_text: str
    market: str
    personality: str
    analysis_summary: str


def build_chat_agent_node(state: ChatState):
    """Chat agent with access to tools and conversation memory."""
    llm = get_llm(temperature=0.4).bind_tools(ALL_TOOLS)

    # Build analysis summary for context
    system_content = CHAT_SYSTEM_PROMPT.format(
        market=state["market"],
        contract_text=state["contract_text"][:4000],  # Truncate for context window
        analysis_summary=state.get("analysis_summary", "Analysis available.")
    )

    # Add personality
    personality = state.get("personality", "friendly")
    if personality in PERSONALITY_PROMPTS:
        system_content += f"\n\nTONE: {PERSONALITY_PROMPTS[personality]}"

    messages = [SystemMessage(content=system_content)] + state["messages"]
    response = llm.invoke(messages)
    return {"messages": [response]}


def build_chat_graph():
    """Chat graph without checkpointer to avoid SQLite conflicts on Windows."""
    tool_node = ToolNode(ALL_TOOLS)

    graph = StateGraph(ChatState)
    graph.add_node("agent", build_chat_agent_node)
    graph.add_node("tools", tool_node)

    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", tools_condition)
    graph.add_edge("tools", "agent")
   

    return graph.compile()


# ── In-memory chat history store (replaces MemorySaver) ─────────────────────
chat_histories: dict = {}


# ── Singleton instances ─────────────────────────────────────────────────────
analysis_graph = build_analysis_graph()
chat_graph = build_chat_graph()


# ── Public API functions ────────────────────────────────────────────────────

async def run_contract_analysis(
    contract_text: str,
    market: str,
    personality: str = "friendly",
    personalised_context: str = "",
    user_context: str = ""
) -> dict:
    """
    Run the full contract analysis graph.
    Returns structured analysis dict or raises on error.
    """
    initial_message = HumanMessage(
        content=f"""Please analyse this music contract for an artist from {market}.
{personalised_context}
Use your tools to:
1. Get the market standards for {market}
2. Extract all key contract parameters
3. Calculate the deal score
4. Get negotiation tips for each red flag
5. Check royalty standards

CONTRACT TEXT:
{contract_text[:12000]}

After using the tools, produce the complete JSON analysis as specified."""
    )

    result = await analysis_graph.ainvoke({
        "messages": [initial_message],
        "contract_text": contract_text,
        "market": market,
        "personality": personality,
        "analysis": None,
        "error": None,
    })

    if result.get("error"):
        raise ValueError(result["error"])

    if not result.get("analysis"):
        raise ValueError("Analysis did not complete. Please try again.")

    return result["analysis"]


async def run_chat_message(
    user_message: str,
    contract_text: str,
    market: str,
    thread_id: str,
    analysis_summary: str = "",
    personality: str = "friendly"
) -> str:
    """
    Run a single chat message with manual conversation history.
    thread_id is used to maintain conversation history per session.
    """
    # Get or create history for this thread
    if thread_id not in chat_histories:
        chat_histories[thread_id] = []

    history = chat_histories[thread_id]
    history.append(HumanMessage(content=user_message))

    result = await chat_graph.ainvoke(
        {
            "messages": history,
            "contract_text": contract_text,
            "market": market,
            "personality": personality,
            "analysis_summary": analysis_summary,
        }
    )

    # Extract the last AI message and save to history
    for msg in reversed(result["messages"]):
        if isinstance(msg, AIMessage) and msg.content:
            chat_histories[thread_id].append(msg)
            # Keep history manageable — last 20 messages
            if len(chat_histories[thread_id]) > 20:
                chat_histories[thread_id] = chat_histories[thread_id][-20:]
            return msg.content

    return "I couldn't generate a response. Please try again."