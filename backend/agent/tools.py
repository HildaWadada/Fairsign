"""
FairSign — LangChain Tools
Each tool is a function the LangGraph agent can call via OpenAI function calling.
"""

import json
from langchain_core.tools import tool

# ── African market knowledge base ──────────────────────────────────────────
MARKET_DATA = {
    "Uganda": {
        "royalty_rate_range": "10–15%",
        "typical_advance": "$1,000–$5,000 USD",
        "standard_term": "1–2 years",
        "masters_norm": "Label usually retains masters; artist ownership is rare but negotiable",
        "deal_360_norm": "Uncommon; if present, 8–12% is typical",
        "streaming_royalty": "15–18% of net receipts",
        "performance_rights_body": "UPRS (Uganda Performing Rights Society)",
        "governing_law_note": "Contracts governed by foreign law (e.g. California) disadvantage Ugandan artists — push for Ugandan or neutral jurisdiction.",
        "context": "Uganda's industry is rapidly growing, led by Afrobeats, Afropop, and Dancehall. Most artists sign with small local labels or regional distributors. International label interest is increasing post-Eddy Kenzo and Azawi. Always verify a label's UPRS registration.",
        "red_flag_culture": "Beware of verbal agreements or undated contracts — enforce everything in writing.",
    },
    "Nigeria": {
        "royalty_rate_range": "15–22%",
        "typical_advance": "$5,000–$100,000+ USD",
        "standard_term": "1–3 years",
        "masters_norm": "Labels retain masters; increasingly negotiable for established artists",
        "deal_360_norm": "Common; 15–25% across touring, merch, endorsements",
        "streaming_royalty": "18–22% of net receipts",
        "performance_rights_body": "COSON (Copyright Society of Nigeria)",
        "governing_law_note": "Many international labels use US/UK law — Nigerian artists should push for Lagos arbitration clauses.",
        "context": "Nigeria has Africa's most commercially developed music industry. Afrobeats dominance globally means Nigerian artists have strong negotiating leverage. COSON registration is mandatory for royalty collection. Watch for 'all-in' royalty structures that bundle recording and publishing.",
        "red_flag_culture": "360 deals are standard but often above-market. 25%+ on all income streams is predatory.",
    },
    "Kenya": {
        "royalty_rate_range": "12–18%",
        "typical_advance": "$2,000–$20,000 USD",
        "standard_term": "1–2 years",
        "masters_norm": "Negotiable; artist-friendly deals increasing, especially for independent artists",
        "deal_360_norm": "Emerging; 10–18% if present",
        "streaming_royalty": "16–20% of net receipts",
        "performance_rights_body": "MCSK (Music Copyright Society of Kenya)",
        "governing_law_note": "Kenyan Copyright Act (Cap 130) governs local deals — foreign law clauses should be challenged.",
        "context": "Kenya's industry is growing via Gengetone, Afropop, and Gospel. East African Breweries and Safaricom are major brand partners. MCSK membership is essential for any performing artist. Nairobi is becoming a regional hub for East African music business.",
        "red_flag_culture": "Watch for hidden sub-publishing clauses that transfer your songwriting royalties without clear explanation.",
    },
    "South Africa": {
        "royalty_rate_range": "16–25%",
        "typical_advance": "$5,000–$50,000 USD",
        "standard_term": "1–3 years",
        "masters_norm": "Negotiable; South African artists increasingly retain masters or get reversion clauses",
        "deal_360_norm": "Common; 15–25% is market standard",
        "streaming_royalty": "18–25% of net receipts",
        "performance_rights_body": "SAMRO (Southern African Music Rights Organisation) + RISA",
        "governing_law_note": "South African law provides the most artist-friendly framework on the continent. Copyright Amendment Bill pending — stay updated.",
        "context": "South Africa has the continent's most mature music industry and legal infrastructure. Amapiano's global explosion has dramatically improved negotiating power for SA artists. SAMRO + RISA dual registration is standard. Many international labels now have Johannesburg offices.",
        "red_flag_culture": "With higher advances comes more aggressive recoupment — always negotiate a reduced recoupment rate on 50%+ of costs.",
    },
}

SEVERITY_WEIGHTS = {
    "perpetual_ownership": ("high", "Label owns masters forever — you can never buy them back or reclaim them."),
    "options": ("high", "Label can extend your contract unilaterally — you could be locked in for years."),
    "360_deal_high": ("high", "Label takes a cut of ALL your income, including live shows and brand deals."),
    "low_royalty": ("high", "Royalty rate is below market standard for your region."),
    "all_recording_costs": ("high", "All recording costs charged to you before you earn a cent — this is called recoupment."),
    "no_creative_control": ("medium", "You cannot choose your own songs, producers, or sound."),
    "foreign_jurisdiction": ("medium", "Disputes must be settled in a foreign country — expensive and inaccessible for you."),
    "digital_royalty_reduction": ("medium", "Digital streams pay less than physical sales — backwards in today's market."),
    "long_audit_window": ("medium", "90-day accounting delay and limited audit rights makes it hard to verify royalties."),
    "no_reversion": ("low", "No clause allowing you to reclaim rights if the label doesn't actively release your music."),
}


# ── TOOL 1: Get market standards ───────────────────────────────────────────
@tool
def get_market_standards(market: str) -> str:
    """
    Returns the music industry contract standards and norms for a specific
    African market (Uganda, Nigeria, Kenya, or South Africa).
    Use this to benchmark the contract terms being reviewed.
    """
    data = MARKET_DATA.get(market, MARKET_DATA["Uganda"])
    return json.dumps(data, indent=2)


# ── TOOL 2: Calculate deal score ───────────────────────────────────────────
@tool
def calculate_deal_score(
    royalty_rate_percent: float,
    artist_keeps_masters: bool,
    has_360_deal: bool,
    deal_360_percentage: float,
    term_years: int,
    has_creative_control: bool,
    advance_usd: float,
    all_costs_recoupable: bool,
    market: str,
) -> str:
    """
    Calculates a deal fairness score from 1 to 10 for a music contract.
    Returns a score, label, and detailed reasoning per factor.
    Use this after extracting all key contract parameters.
    """
    score = 5.0
    factors = []


    # Royalty rate
    standards = MARKET_DATA.get(market, MARKET_DATA["Uganda"])
    try:
        low, high = [float(x.replace("%", "").strip()) for x in standards["royalty_rate_range"].split("–")]
        midpoint = (low + high) / 2
        if royalty_rate_percent >= high:
            score += 1.5
            factors.append({"factor": "Royalty Rate", "impact": "+1.5", "note": f"{royalty_rate_percent}% is at or above the {market} market high ({high}%)"})
        elif royalty_rate_percent >= midpoint:
            score += 0.5
            factors.append({"factor": "Royalty Rate", "impact": "+0.5", "note": f"{royalty_rate_percent}% is near the {market} market average"})
        elif royalty_rate_percent < low:
            score -= 2.0
            factors.append({"factor": "Royalty Rate", "impact": "-2.0", "note": f"{royalty_rate_percent}% is below the {market} market minimum ({low}%). This is a red flag."})
        else:
            score -= 0.5
            factors.append({"factor": "Royalty Rate", "impact": "-0.5", "note": f"{royalty_rate_percent}% is below the {market} midpoint — room to negotiate"})
    except Exception:
        factors.append({"factor": "Royalty Rate", "impact": "0", "note": "Could not parse royalty rate"})

    # Masters
    if artist_keeps_masters:
        score += 1.5
        factors.append({"factor": "Master Ownership", "impact": "+1.5", "note": "Artist retains masters — huge win for long-term income"})
    else:
        score -= 2.0
        factors.append({"factor": "Master Ownership", "impact": "-2.0", "note": "Label owns your masters forever — your most valuable asset is gone"})

    # 360 deal
    if has_360_deal:
        if deal_360_percentage > 25:
            score -= 2.0
            factors.append({"factor": "360 Deal", "impact": "-2.0", "note": f"{deal_360_percentage}% is above market norm — label is taking too much of your non-recording income"})
        elif deal_360_percentage > 15:
            score -= 1.0
            factors.append({"factor": "360 Deal", "impact": "-1.0", "note": f"{deal_360_percentage}% 360 deal is present but within market range for {market}"})
        else:
            score -= 0.5
            factors.append({"factor": "360 Deal", "impact": "-0.5", "note": f"{deal_360_percentage}% 360 deal is below market norm — acceptable"})
    else:
        score += 0.5
        factors.append({"factor": "360 Deal", "impact": "+0.5", "note": "No 360 deal — you keep all your touring and endorsement income"})

    # Term
    if term_years > 3:
        score -= 1.5
        factors.append({"factor": "Contract Term", "impact": "-1.5", "note": f"{term_years} years is a long commitment — especially risky with option periods"})
    elif term_years <= 1:
        score += 1.0
        factors.append({"factor": "Contract Term", "impact": "+1.0", "note": f"{term_years} year term is short and artist-friendly"})
    else:
        factors.append({"factor": "Contract Term", "impact": "0", "note": f"{term_years} years is standard for {market}"})

    # Creative control
    if has_creative_control:
        score += 0.5
        factors.append({"factor": "Creative Control", "impact": "+0.5", "note": "You control your artistic direction"})
    else:
        score -= 1.0
        factors.append({"factor": "Creative Control", "impact": "-1.0", "note": "Label controls your music — they can veto songs, producers, even your sound"})

    # Recoupment
    if all_costs_recoupable:
        score -= 1.0
        factors.append({"factor": "Recoupment", "impact": "-1.0", "note": "All costs (recording, videos, promo) recouped from YOUR royalties before you earn anything"})
    else:
        score += 0.5
        factors.append({"factor": "Recoupment", "impact": "+0.5", "note": "Not all costs charged to your account"})

    final_score = max(1.0, min(10.0, round(score, 1)))
    if final_score >= 7.5:
        label = "Artist-Friendly"
    elif final_score >= 5.5:
        label = "Mixed Bag"
    elif final_score >= 3.5:
        label = "Risky Deal"
    else:
        label = "Exploitative"

    return json.dumps({
        "score": final_score,
        "label": label,
        "factors": factors,
        "summary": f"This deal scores {final_score}/10 ({label}). {'Proceed with caution.' if final_score < 5 else 'Some terms need negotiation.' if final_score < 7 else 'A reasonable deal — still negotiate on weak points.'}"
    }, indent=2)


# ── TOOL 3: Search royalty rate standards ──────────────────────────────────
@tool
def search_royalty_standards(market: str, income_type: str = "streaming") -> str:
    """
    Returns current royalty rate standards and collection body information
    for a specific African music market and income type.
    Income types: streaming, physical, sync, performance, publishing.
    Use this to compare specific royalty clauses against real benchmarks.
    """
    royalty_db = {
        "Uganda": {
            "streaming": {"rate": "15–18%", "notes": "Boomplay and Audiomack dominate streaming; Spotify growing", "body": "UPRS"},
            "physical": {"rate": "10–14%", "notes": "Physical sales declining but still relevant in rural markets", "body": "UPRS"},
            "sync": {"rate": "$500–$5,000 per placement", "notes": "Ugandan TV and radio sync fees are negotiated directly", "body": "UBC"},
            "performance": {"rate": "Collected per broadcast", "notes": "UPRS distributes performance royalties quarterly", "body": "UPRS"},
            "publishing": {"rate": "50% publisher / 50% writer standard", "notes": "Always register compositions separately from masters", "body": "UPRS"},
        },
        "Nigeria": {
            "streaming": {"rate": "18–22%", "notes": "Audiomack, Boomplay, Apple Music, and Spotify are primary DSPs", "body": "COSON"},
            "physical": {"rate": "14–18%", "notes": "Physical market minimal but still exists for Alaba market", "body": "COSON"},
            "sync": {"rate": "$2,000–$50,000 per placement", "notes": "Nollywood sync fees are growing rapidly", "body": "COSON"},
            "performance": {"rate": "Collected per broadcast", "notes": "COSON distributes semi-annually — register immediately", "body": "COSON"},
            "publishing": {"rate": "50/50 is minimum standard", "notes": "Many Nigerian labels demand co-publishing (75/25) — resist this", "body": "COSON"},
        },
        "Kenya": {
            "streaming": {"rate": "16–20%", "notes": "Boomplay and Mdundo are dominant; Spotify growing", "body": "MCSK"},
            "physical": {"rate": "12–16%", "notes": "Physical declining; focus on digital rights", "body": "MCSK"},
            "sync": {"rate": "$1,000–$20,000 per placement", "notes": "Safaricom and local TV are major sync clients", "body": "MCSK"},
            "performance": {"rate": "Collected per broadcast", "notes": "MCSK distributes quarterly after registration", "body": "MCSK"},
            "publishing": {"rate": "50/50 standard", "notes": "Sub-publishing rights often bundled with recording — keep them separate", "body": "MCSK"},
        },
        "South Africa": {
            "streaming": {"rate": "18–25%", "notes": "Spotify, Apple Music, and JOOX are primary DSPs", "body": "SAMRO"},
            "physical": {"rate": "15–20%", "notes": "Physical still relevant in SA market", "body": "RISA"},
            "sync": {"rate": "$2,000–$80,000 per placement", "notes": "SA advertising industry is the most lucrative sync market on the continent", "body": "SAMRO"},
            "performance": {"rate": "Collected per broadcast", "notes": "Register with both SAMRO (compositions) and RISA (recordings)", "body": "SAMRO + RISA"},
            "publishing": {"rate": "50/50 minimum; 75/25 achievable for established artists", "notes": "Most commercially advanced publishing market in Africa", "body": "SAMRO"},
        },
    }

    market_data = royalty_db.get(market, royalty_db["Uganda"])
    income_data = market_data.get(income_type, market_data["streaming"])
    return json.dumps({
        "market": market,
        "income_type": income_type,
        **income_data
    }, indent=2)


# ── TOOL 4: Identify negotiation leverage points ────────────────────────────
@tool
def get_negotiation_tips(clause_type: str, market: str) -> str:
    """
    Returns specific negotiation strategies for a given contract clause type
    and market. Use this to generate actionable advice for each red flag.
    Clause types: royalties, masters, 360_deal, term, creative_control,
    recoupment, audit_rights, territory, jurisdiction, options.
    """
    tips = {
        "royalties": {
            "ask_for": "Increase base royalty by 3–5%. Add escalation clauses (e.g. +2% after 50k units/streams).",
            "walk_away_if": "Rate is below 10% and non-negotiable.",
            "leverage": "Competing label interest, social media following, existing streaming numbers.",
            "template_language": "Artist shall receive a royalty of [X]% escalating to [X+2]% upon recoupment of the Recording Advance.",
        },
        "masters": {
            "ask_for": "Reversion clause: masters revert to artist after 10–15 years or if label fails to actively exploit them.",
            "walk_away_if": "Perpetual, irrevocable assignment with no reversion clause.",
            "leverage": "As a new signing, offer a longer term in exchange for a reversion clause.",
            "template_language": "All Masters shall revert to Artist if Label fails to commercially release the recordings within 18 months, or after a period of 15 years.",
        },
        "360_deal": {
            "ask_for": "Limit 360 to recording income only (streaming + physical). Exclude touring, brand deals, and merchandise.",
            "walk_away_if": "360 participation exceeds 25% across all income streams.",
            "leverage": "Offer a higher commission on recording revenue in exchange for removing the 360 clause.",
            "template_language": "Label's participation in Artist's income shall be limited solely to master recording royalties as defined herein.",
        },
        "term": {
            "ask_for": "Remove option periods or cap them at 2 options maximum. Add performance clauses (options only vest if sales targets are met).",
            "walk_away_if": "4+ option periods with no performance triggers.",
            "leverage": "Agree to a longer initial term in exchange for artist break clauses if minimum release commitments aren't met.",
            "template_language": "Label shall release Artist's recordings within 6 months of delivery, failing which Artist may terminate this Agreement upon 30 days written notice.",
        },
        "creative_control": {
            "ask_for": "Final approval on song selection, producers, featured artists, and artwork. At minimum, approval rights on single selection.",
            "walk_away_if": "Absolute creative control ceded with no approval rights whatsoever.",
            "leverage": "Offer a compromise: label approves the album track list, artist controls singles.",
            "template_language": "Artist shall have final approval over all master recordings delivered hereunder, including song selection and production credits.",
        },
        "recoupment": {
            "ask_for": "Cap recoupable costs. Exclude marketing/promotional spend from recoupment. Negotiate reduced recoupment rate (50–75% of costs instead of 100%).",
            "walk_away_if": "All recording, video, touring, and promotional costs are 100% recoupable.",
            "leverage": "Accept full recoupment of recording costs if label agrees to a higher royalty rate post-recoupment.",
            "template_language": "Recording Costs shall be recouped at 50% of the applicable royalty rate. Marketing and promotional expenses shall not be charged to Artist's account.",
        },
        "audit_rights": {
            "ask_for": "Reduce audit notice from 90 days to 30 days. Allow 2 audits per year. Add error correction clause (if audit finds 5%+ discrepancy, label pays audit costs).",
            "walk_away_if": "No audit rights at all.",
            "leverage": "This clause costs the label nothing unless they're under-reporting — push hard.",
            "template_language": "Artist shall have the right to examine Label's books upon 30 days written notice, twice per year. If examination reveals underpayment exceeding 5%, Label shall reimburse Artist's audit costs.",
        },
        "territory": {
            "ask_for": "Limit to specific territories. Retain rights in regions where label has no distribution infrastructure (e.g. your home country).",
            "walk_away_if": "Worldwide in perpetuity with no performance requirements per territory.",
            "leverage": "Offer worldwide on streaming if label gives you physical rights in East/West Africa.",
            "template_language": "Territory shall be limited to [specific territories]. Rights in all other territories shall remain with Artist.",
        },
        "jurisdiction": {
            "ask_for": "Change governing law to your home country or neutral arbitration (e.g. ICC arbitration in London/Dubai).",
            "walk_away_if": "Foreign jurisdiction with no arbitration alternative (means you'd have to sue in the USA/UK at your own cost).",
            "leverage": "This costs the label little to change — it's a standard negotiation point.",
            "template_language": "This Agreement shall be governed by the laws of [Artist's country]. Disputes shall be resolved by arbitration under ICC Rules in [neutral city].",
        },
        "options": {
            "ask_for": "Remove options entirely. If options must stay, add performance triggers: options only vest if previous album achieves 50k+ streams.",
            "walk_away_if": "4+ option periods all at label's sole discretion.",
            "leverage": "Offer 2 options with clear performance triggers in exchange for removing the additional options.",
            "template_language": "Label's option to extend this Agreement shall only be exercisable if the preceding Album has achieved a minimum of [X] streams on DSPs within 12 months of release.",
        },
    }

    tip = tips.get(clause_type, {
        "ask_for": "Have a music lawyer review this clause specifically.",
        "walk_away_if": "The clause is completely one-sided with no artist protections.",
        "leverage": "Use competing interest as leverage for any negotiation.",
        "template_language": "Seek a music attorney for market-specific language.",
    })

    return json.dumps({"clause": clause_type, "market": market, **tip}, indent=2)


# ── Export all tools as a list ──────────────────────────────────────────────
ALL_TOOLS = [
    get_market_standards,
    calculate_deal_score,
    search_royalty_standards,
    get_negotiation_tips,
]