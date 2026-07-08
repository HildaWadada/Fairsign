'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

type Market = 'Uganda' | 'Nigeria' | 'Kenya' | 'South Africa'

interface PlaylistContact {
  name: string
  platform: 'Audiomack' | 'Spotify' | 'Boomplay' | 'YouTube'
  followers: string
  how: string
  contact: string
  contactType: 'email' | 'twitter' | 'instagram' | 'portal' | 'spotify'
  contactUrl: string
  genre: string
  responseTime: string
}

interface BlogContact {
  name: string
  focus: string
  email: string
  emailSubject: string
  twitter?: string
  twitterUrl?: string
  submitUrl?: string
  tip: string
}

interface RadioStation {
  name: string
  city: string
  show?: string
  contact: string
  contactUrl: string
  bestTime?: string
  tip: string
}

interface PromotionData {
  playlists: PlaylistContact[]
  blogs: BlogContact[]
  radio: RadioStation[]
  quickWins: { action: string; url: string; label: string }[]
}

const DATA: Record<Market, PromotionData> = {
  Uganda: {
    playlists: [
      {
        name: 'Ugandan Hits',
        platform: 'Audiomack',
        followers: '18k+',
        how: 'DM curator on Twitter/X with your Audiomack link. Include genre, BPM and a one-line pitch.',
        contact: '@ugandahits_am',
        contactType: 'twitter',
        contactUrl: 'https://twitter.com/ugandahits_am',
        genre: 'Afrobeats, Dancehall',
        responseTime: '3–7 days',
      },
      {
        name: 'East Africa Fresh',
        platform: 'Audiomack',
        followers: '32k+',
        how: 'Email with subject line "Submission – [Artist] – [Track]". Attach a press photo and one-paragraph bio.',
        contact: 'eastafricafresh@gmail.com',
        contactType: 'email',
        contactUrl: 'mailto:eastafricafresh@gmail.com?subject=Submission – [Artist] – [Track]&body=Hi East Africa Fresh team,%0D%0A%0D%0AI would like to submit my track for playlist consideration.%0D%0A%0D%0AArtist:%0D%0ATrack:%0D%0AGenre:%0D%0AAudiomack link:%0D%0A%0D%0AThank you.',
        genre: 'All genres',
        responseTime: '1–2 weeks',
      },
      {
        name: 'Kampala Vibes',
        platform: 'Boomplay',
        followers: '9k+',
        how: 'Submit via Boomplay for Artists dashboard. Tag your music with "Uganda" and "Kampala" in your metadata.',
        contact: 'Boomplay for Artists',
        contactType: 'portal',
        contactUrl: 'https://artists.boomplaymusic.com',
        genre: 'Afropop, RnB',
        responseTime: '5–10 days',
      },
      {
        name: 'New Music East Africa',
        platform: 'Spotify',
        followers: '4.2k',
        how: 'Use Spotify for Artists pitch tool at least 7 days before release. Select "East Africa" as mood context.',
        contact: 'Spotify for Artists',
        contactType: 'spotify',
        contactUrl: 'https://artists.spotify.com/pitch',
        genre: 'All genres',
        responseTime: '7 days before release',
      },
      {
        name: 'Uganda Gospel Hits',
        platform: 'Audiomack',
        followers: '12k+',
        how: 'DM on Instagram with Audiomack link. Gospel and Christian contemporary only.',
        contact: '@ugandagospelhits',
        contactType: 'instagram',
        contactUrl: 'https://instagram.com/ugandagospelhits',
        genre: 'Gospel',
        responseTime: '2–5 days',
      },
    ],
    blogs: [
      {
        name: 'Howwe Music',
        focus: "Uganda's largest music news site. Covers new releases, interviews, events.",
        email: 'info@howwe.biz',
        emailSubject: 'Music Submission – [Artist Name] – [Track Title]',
        submitUrl: 'https://www.howwe.biz',
        tip: 'Send a press release with an HD photo, YouTube link and a 2-sentence quote from the artist.',
      },
      {
        name: 'Sqoop Uganda',
        focus: 'Entertainment news with strong readership among Kampala youth.',
        email: 'entertainment@sqoop.co.ug',
        emailSubject: 'Music Feature Request – [Artist Name]',
        tip: 'Pitch a feature angle — not just a release. "Artist from Wandegeya breaks 10k streams" works better than "New song out".',
      },
      {
        name: 'Chano8',
        focus: 'Music reviews, interviews and event coverage for East Africa.',
        email: 'chano8ug@gmail.com',
        emailSubject: 'New Music Submission – [Artist Name]',
        twitter: '@chano8',
        twitterUrl: 'https://twitter.com/chano8',
        tip: 'They respond well to Twitter DMs. Include a SoundCloud or Audiomack preview link — not a download.',
      },
      {
        name: 'MBU Uganda',
        focus: 'Entertainment lifestyle site. Good for visual artists with strong imagery.',
        email: 'info@mbu.ug',
        emailSubject: 'Artist Feature – [Artist Name]',
        tip: 'Include at least 3 high-resolution photos (1MB+). They frequently run gallery posts.',
      },
    ],
    radio: [
      {
        name: 'Galaxy FM 100.2',
        city: 'Kampala',
        show: 'New Music Monday',
        contact: 'promotions@galaxyfm.co.ug',
        contactUrl: 'mailto:promotions@galaxyfm.co.ug?subject=Music Submission – [Artist] – [Track]&body=Hi Galaxy FM team,%0D%0A%0D%0APlease find my music submission attached.%0D%0A%0D%0AArtist:%0D%0ATrack:%0D%0AGenre:%0D%0AStreaming link:%0D%0A%0D%0AThank you.',
        bestTime: 'Monday–Wednesday, 9am–12pm',
        tip: 'Send a WAV file (not MP3), artist bio, and your social handles. Follow up by calling if no response in 5 days.',
      },
      {
        name: 'CBS FM 88.8',
        city: 'Kampala',
        show: 'Emirandula',
        contact: 'music@cbsfm.co.ug',
        contactUrl: 'mailto:music@cbsfm.co.ug?subject=Music Submission – [Artist] – [Track]',
        bestTime: 'Tuesday and Thursday mornings',
        tip: 'Luganda-language tracks get strong rotation here. If your track has a Luganda hook, mention it in your pitch subject line.',
      },
      {
        name: 'Spark TV / NBS TV',
        city: 'Kampala',
        show: 'Uncut (music video show)',
        contact: 'uncut@sparktv.ug',
        contactUrl: 'mailto:uncut@sparktv.ug?subject=Music Video Submission – [Artist]',
        tip: 'Send an MP4 (H.264, 1080p minimum). Include a clearance letter if you sample anything.',
      },
      {
        name: 'Capital FM 91.3',
        city: 'Kampala',
        show: 'Capital Countdown',
        contact: 'music@capitalfm.co.ug',
        contactUrl: 'mailto:music@capitalfm.co.ug?subject=Music Submission – [Artist]',
        bestTime: 'Monday, before noon',
        tip: 'Best for Afropop and RnB. A strong streaming number (5k+ Audiomack) mentioned in your pitch helps.',
      },
    ],
    quickWins: [
      { action: "Submit to Audiomack's New & Notable editorial — updated weekly", url: 'https://audiomack.com/submit', label: 'Submit on Audiomack' },
      { action: 'Add music to Boomplay Uganda editorial — email ug@boomplay.com', url: 'mailto:ug@boomplay.com?subject=Editorial Submission – Uganda Artist&body=Hi Boomplay Uganda team,%0D%0A%0D%0AI would like to submit my music for editorial playlist consideration.%0D%0A%0D%0AArtist:%0D%0ABoomplay link:%0D%0AGenre:%0D%0A%0D%0AThank you.', label: 'Email Boomplay Uganda' },
      { action: 'Register with UPRS to collect radio royalties', url: 'https://ugandaperformers.org', label: 'Register with UPRS' },
      { action: 'Post in Ugandan Artists Network Facebook group (65k members)', url: 'https://www.facebook.com/groups/ugandanartistsnetwork', label: 'Join Facebook Group' },
      { action: 'Apply for Audiomack Africa editorial consideration', url: 'https://audiomack.com/submit', label: 'Apply on Audiomack' },
      { action: 'Submit music video to NTV Uganda — weekly new music slot', url: 'mailto:music@ntv.co.ug?subject=Music Video Submission', label: 'Email NTV Uganda' },
    ],
  },

  Kenya: {
    playlists: [
      {
        name: 'Nairobi Heat',
        platform: 'Spotify',
        followers: '11k+',
        how: 'Pitch via Spotify for Artists. Use "Nairobi" and "Gengetone" or "Afropop" tags. Submit 7+ days before release.',
        contact: 'Spotify for Artists',
        contactType: 'spotify',
        contactUrl: 'https://artists.spotify.com/pitch',
        genre: 'Gengetone, Afropop',
        responseTime: '7 days',
      },
      {
        name: 'Kenya Bongo Fresh',
        platform: 'Audiomack',
        followers: '22k+',
        how: 'DM curator on Instagram with Audiomack stream link. Keep your pitch under 3 sentences.',
        contact: '@kenyabongofresh',
        contactType: 'instagram',
        contactUrl: 'https://instagram.com/kenyabongofresh',
        genre: 'Bongo, Afrobeats',
        responseTime: '3–5 days',
      },
      {
        name: 'East Africa Charts',
        platform: 'Boomplay',
        followers: '41k+',
        how: 'Submit via the Boomplay for Artists submission portal.',
        contact: 'Boomplay for Artists',
        contactType: 'portal',
        contactUrl: 'https://artists.boomplaymusic.com',
        genre: 'All genres',
        responseTime: '1 week',
      },
      {
        name: 'Kenyan Gospel Praise',
        platform: 'Audiomack',
        followers: '8k+',
        how: 'Email with MP3 + album art. Gospel only. Include lyrics for review.',
        contact: 'kenyangospelpraise@gmail.com',
        contactType: 'email',
        contactUrl: 'mailto:kenyangospelpraise@gmail.com?subject=Gospel Music Submission',
        genre: 'Gospel',
        responseTime: '5–10 days',
      },
    ],
    blogs: [
      {
        name: 'Ghafla Kenya',
        focus: 'Biggest Kenyan entertainment blog. Strong traffic from Nairobi youth.',
        email: 'info@ghafla.co.ke',
        emailSubject: 'Exclusive Music Feature – [Artist Name]',
        submitUrl: 'https://www.ghafla.co.ke',
        tip: 'They love exclusive content. Offer them a "first listen" or interview timed to your release.',
      },
      {
        name: 'Standard Entertainment',
        focus: 'Standard Media Group. Legacy print + digital with wide Kenyan reach.',
        email: 'entertainment@standardmedia.co.ke',
        emailSubject: 'PRESS RELEASE – [Artist Name] – [Date]',
        tip: 'Send a proper press release. Name it "PRESS RELEASE – [Artist] – [Date]". Attach 2 photos.',
      },
      {
        name: 'Mpasho',
        focus: 'Celebrity and entertainment news. Strong Instagram and Facebook crossover.',
        email: 'editorial@mpasho.co.ke',
        emailSubject: 'Music Feature – [Artist Name]',
        twitter: '@MpashoNews',
        twitterUrl: 'https://twitter.com/MpashoNews',
        tip: 'Mpasho responds to Twitter DMs fastest. Include a 10–15 second video clip.',
      },
      {
        name: 'Nairobi Wire',
        focus: 'Kenya news and entertainment. Strong Google search traffic.',
        email: 'tips@nairobiwire.com',
        emailSubject: 'Music Story – [Artist] hits [milestone]',
        tip: 'Frame your submission as a news story — "Nairobi artist hits 50k streams in 2 weeks".',
      },
    ],
    radio: [
      {
        name: 'Capital FM Kenya 98.4',
        city: 'Nairobi',
        show: 'The Big Breakfast',
        contact: 'music@capitalfm.co.ke',
        contactUrl: 'mailto:music@capitalfm.co.ke?subject=Music Submission – [Artist] – [Track]',
        bestTime: 'Monday before noon',
        tip: 'Largest FM reach in Kenya. Send WAV + bio + Spotify/Audiomack link.',
      },
      {
        name: 'Radio Jambo 96.3',
        city: 'Nairobi',
        show: 'Mseto East Africa',
        contact: 'music@radiojambo.co.ke',
        contactUrl: 'mailto:music@radiojambo.co.ke?subject=Music Submission – [Artist]',
        bestTime: 'Tuesday morning',
        tip: 'Swahili-leaning audience. If your track has Swahili lyrics, highlight that in the subject line.',
      },
      {
        name: 'Kiss FM Kenya 100.3',
        city: 'Nairobi',
        show: 'Kiss Breakfast',
        contact: 'music@kiss100.co.ke',
        contactUrl: 'mailto:music@kiss100.co.ke?subject=Music Submission – [Artist]',
        bestTime: 'Weekdays, before 10am',
        tip: 'Best for English-language pop and Afrobeats. A strong social following mentioned in the pitch helps.',
      },
      {
        name: 'NTV Kenya Fresh',
        city: 'Nairobi',
        show: 'NTV Fresh (Music Videos)',
        contact: 'fresh@ntv.co.ke',
        contactUrl: 'mailto:fresh@ntv.co.ke?subject=Music Video Submission – [Artist]',
        tip: 'Submit your music video to their weekly new music slot. Send MP4 1080p.',
      },
    ],
    quickWins: [
      { action: 'Submit to Boomplay Kenya editorial', url: 'mailto:ke@boomplay.com?subject=Editorial Submission – Kenya Artist', label: 'Email Boomplay Kenya' },
      { action: 'Register with MCSK to collect royalties', url: 'https://mcsk.or.ke', label: 'Register with MCSK' },
      { action: 'Pitch to Spotify for Artists', url: 'https://artists.spotify.com/pitch', label: 'Pitch on Spotify' },
      { action: 'Submit to Audiomack editorial', url: 'https://audiomack.com/submit', label: 'Submit on Audiomack' },
      { action: 'Apply to NTV Kenya Fresh music video slot', url: 'mailto:fresh@ntv.co.ke?subject=Music Video Submission', label: 'Email NTV Fresh' },
      { action: 'Submit to Boomplay Nairobi Vibes editorial playlist', url: 'mailto:ke@boomplay.com?subject=Nairobi Vibes Playlist Submission', label: 'Email Boomplay' },
    ],
  },

  Nigeria: {
    playlists: [
      {
        name: 'Afrobeats Central',
        platform: 'Spotify',
        followers: '180k+',
        how: 'Pitch via Spotify for Artists. Nigerian artists with 1k+ monthly listeners are prioritised. Submit 10 days before release.',
        contact: 'Spotify for Artists',
        contactType: 'spotify',
        contactUrl: 'https://artists.spotify.com/pitch',
        genre: 'Afrobeats, Afropop',
        responseTime: '7–10 days',
      },
      {
        name: 'Naija Street Hop',
        platform: 'Audiomack',
        followers: '95k+',
        how: 'DM @naijastreethop on Twitter. One link, one sentence.',
        contact: '@naijastreethop',
        contactType: 'twitter',
        contactUrl: 'https://twitter.com/naijastreethop',
        genre: 'Street-hop, Alté, Afrobeats',
        responseTime: '2–5 days',
      },
      {
        name: 'Nigeria Top 100',
        platform: 'Boomplay',
        followers: '210k+',
        how: 'Submit via Boomplay for Artists portal. Tag "Nigeria", "Lagos" and your genre.',
        contact: 'Boomplay for Artists',
        contactType: 'portal',
        contactUrl: 'https://artists.boomplaymusic.com',
        genre: 'All genres',
        responseTime: '1 week',
      },
      {
        name: 'Gospel Naija',
        platform: 'Audiomack',
        followers: '28k+',
        how: 'Email with MP3, artwork, and a short testimony/background to the song.',
        contact: 'gospelnaijacurator@gmail.com',
        contactType: 'email',
        contactUrl: 'mailto:gospelnaijacurator@gmail.com?subject=Gospel Music Submission – [Artist]',
        genre: 'Nigerian Gospel',
        responseTime: '1–2 weeks',
      },
      {
        name: 'Alte Cruise',
        platform: 'Spotify',
        followers: '14k',
        how: 'Email with Spotify track link and a bio that explains your artistic vision. Alt-leaning only.',
        contact: 'altecruise@gmail.com',
        contactType: 'email',
        contactUrl: 'mailto:altecruise@gmail.com?subject=Alté Music Submission – [Artist]',
        genre: 'Alté, Alternative',
        responseTime: '1–3 weeks',
      },
    ],
    blogs: [
      {
        name: 'Notjustok',
        focus: 'Oldest and most-respected Nigerian music blog. Pan-African reach.',
        email: 'music@notjustok.com',
        emailSubject: 'Music Submission – [Artist Name] – [Track Title]',
        submitUrl: 'https://notjustok.com/submit',
        tip: 'Use their submission form. Include an EPK: bio, hi-res photo, Audiomack/Spotify link, and YouTube video.',
      },
      {
        name: 'Jaguda',
        focus: 'Nigerian music reviews and interviews with strong Twitter engagement.',
        email: 'hello@jaguda.com',
        emailSubject: 'Music Review Submission – [Artist]',
        twitter: '@JagudaNG',
        twitterUrl: 'https://twitter.com/JagudaNG',
        tip: 'They write detailed reviews. Pitch songs with something interesting lyrically.',
      },
      {
        name: 'Pulse Nigeria',
        focus: 'Largest entertainment site in Nigeria.',
        email: 'entertainment@pulse.ng',
        emailSubject: 'Music Coverage – [Artist Name] – [Milestone/Angle]',
        tip: 'Pitch via Twitter @PulseNigeria247 with a strong hook — milestone, viral moment, or debut.',
      },
      {
        name: 'OkayAfrica',
        focus: 'Pan-African culture. Strong US and UK diaspora readership.',
        email: 'music@okayafrica.com',
        emailSubject: 'Music Submission – [Artist] – [International Angle]',
        tip: 'Best for artists with an international angle or touring outside Nigeria.',
      },
    ],
    radio: [
      {
        name: 'Beat FM Lagos 99.9',
        city: 'Lagos',
        show: 'The Morning Rush',
        contact: 'music@thebeatfm.com.ng',
        contactUrl: 'mailto:music@thebeatfm.com.ng?subject=Music Submission – [Artist] – [Track]',
        bestTime: 'Monday and Tuesday, before 11am',
        tip: "Lagos's biggest urban radio station. Send a polished one-page EPK.",
      },
      {
        name: 'Cool FM Lagos 96.9',
        city: 'Lagos',
        show: 'The Juice',
        contact: 'music@coolfm.com.ng',
        contactUrl: 'mailto:music@coolfm.com.ng?subject=Music Submission – [Artist]',
        bestTime: 'Wednesday morning',
        tip: 'Strong playlist rotation for Afrobeats and pop. Follow up calls are expected after 5 business days.',
      },
      {
        name: 'Wazobia FM 94.1',
        city: 'Lagos',
        show: 'Oga Titus Show',
        contact: 'info@wazobiafm.com',
        contactUrl: 'mailto:info@wazobiafm.com?subject=Music Submission – [Artist]',
        tip: 'Pidgin-English station with massive working-class Nigerian reach. If you rap in Pidgin, say so in subject line.',
      },
      {
        name: 'Rhythm FM 93.7',
        city: 'Lagos',
        show: 'AM Drive',
        contact: 'music@rhythmfm.com.ng',
        contactUrl: 'mailto:music@rhythmfm.com.ng?subject=Music Submission – [Artist]',
        bestTime: 'Tuesday, before noon',
        tip: 'Strong in South-West Nigeria. Good for artists with a street or mainstream pop sound.',
      },
    ],
    quickWins: [
      { action: 'Submit to Audiomack Nigeria editorial', url: 'https://audiomack.com/submit', label: 'Submit on Audiomack' },
      { action: 'Register with COSON before your next release', url: 'https://coson.com.ng', label: 'Register with COSON' },
      { action: 'Pitch to Spotify for Artists', url: 'https://artists.spotify.com/pitch', label: 'Pitch on Spotify' },
      { action: 'Submit to Boomplay Nigeria top charts', url: 'mailto:ng@boomplay.com?subject=Editorial Submission – Nigeria Artist', label: 'Email Boomplay Nigeria' },
      { action: 'Apply for Apple Music Africa Rising via your distributor', url: 'https://artists.apple.com', label: 'Apple Music for Artists' },
      { action: 'Submit to Notjustok via their official form', url: 'https://notjustok.com/submit', label: 'Submit to Notjustok' },
    ],
  },

  'South Africa': {
    playlists: [
      {
        name: 'Amapiano & Afro House',
        platform: 'Spotify',
        followers: '220k+',
        how: 'Pitch via Spotify for Artists. Tag Amapiano or Afro House genre precisely. Submit 10 days before release.',
        contact: 'Spotify for Artists',
        contactType: 'spotify',
        contactUrl: 'https://artists.spotify.com/pitch',
        genre: 'Amapiano, Afro House',
        responseTime: '7–10 days',
      },
      {
        name: 'SA Hip Hop Daily',
        platform: 'Audiomack',
        followers: '38k+',
        how: 'DM @sahiphopda on Twitter. Include streaming link and a one-line bar about the track.',
        contact: '@sahiphopda',
        contactType: 'twitter',
        contactUrl: 'https://twitter.com/sahiphopda',
        genre: 'SA Hip Hop, Rap',
        responseTime: '2–4 days',
      },
      {
        name: 'Mzansi Music Charts',
        platform: 'Boomplay',
        followers: '55k+',
        how: 'Submit via Boomplay for Artists portal. Tag "South Africa" and "Mzansi".',
        contact: 'Boomplay for Artists',
        contactType: 'portal',
        contactUrl: 'https://artists.boomplaymusic.com',
        genre: 'All SA genres',
        responseTime: '1 week',
      },
      {
        name: 'Gqom Nation',
        platform: 'Audiomack',
        followers: '19k+',
        how: 'DM curator on Instagram with your Audiomack link. Gqom only.',
        contact: '@gqomnationsa',
        contactType: 'instagram',
        contactUrl: 'https://instagram.com/gqomnationsa',
        genre: 'Gqom',
        responseTime: '3–7 days',
      },
    ],
    blogs: [
      {
        name: 'ZAlebs',
        focus: "South Africa's largest celebrity and entertainment site.",
        email: 'info@zalebs.com',
        emailSubject: 'Artist Feature – [Artist Name] – [Story Angle]',
        submitUrl: 'https://www.zalebs.com',
        tip: 'Pitch a story angle — personal journey, collaboration story, or social impact. Pure release announcements get ignored.',
      },
      {
        name: 'SA Hip Hop Mag',
        focus: 'Premier SA hip hop publication. Print and digital.',
        email: 'music@sahiphop.co.za',
        emailSubject: 'Music Submission – [Artist Name]',
        twitter: '@SAHipHopMag',
        twitterUrl: 'https://twitter.com/SAHipHopMag',
        tip: 'Twitter DMs get faster responses. Include a 30-second voice note of your best verse.',
      },
      {
        name: 'Amapiano is a Lifestyle',
        focus: 'Dedicated Amapiano blog and events platform.',
        email: 'submissions@amapianoisalifestyle.com',
        emailSubject: 'Amapiano Submission – [Artist] – [Track]',
        tip: 'Include your log drum credits and producer collaborators. Production credits are highly valued.',
      },
      {
        name: 'The Juice SA',
        focus: 'Urban entertainment site. Strong youth demographic.',
        email: 'editorial@thejuice.co.za',
        emailSubject: 'Music Feature – [Artist Name]',
        tip: 'They respond well to stories with a socially conscious or community angle.',
      },
    ],
    radio: [
      {
        name: '5FM (SABC)',
        city: 'National',
        show: '5FM Top 40',
        contact: '5fm@sabc.co.za',
        contactUrl: 'mailto:5fm@sabc.co.za?subject=Music Submission – [Artist] – SAMRO Registered',
        bestTime: 'Monday, before noon',
        tip: 'Send WAV, HD photo, bio and SAMRO registration number. Registration is essential.',
      },
      {
        name: 'Metro FM (SABC)',
        city: 'National',
        show: 'Metro FM Music Awards Countdown',
        contact: 'metrofm@sabc.co.za',
        contactUrl: 'mailto:metrofm@sabc.co.za?subject=Music Submission – [Artist]',
        bestTime: 'Tuesday morning',
        tip: 'Strong for Amapiano, Afro House and SA RnB. Include your SAMRO or RISA registration.',
      },
      {
        name: 'YFM 99.2',
        city: 'Johannesburg',
        show: 'Y Mornings',
        contact: 'music@yfm.co.za',
        contactUrl: 'mailto:music@yfm.co.za?subject=Music Submission – [Artist]',
        bestTime: 'Wednesday, before 10am',
        tip: 'Joburg youth station. Best for SA Hip Hop, Gqom and Amapiano. They respond to Instagram DMs — @yfmsa.',
      },
      {
        name: 'Gagasi FM 99.5',
        city: 'Durban',
        show: 'The Drive',
        contact: 'music@gagasifm.co.za',
        contactUrl: 'mailto:music@gagasifm.co.za?subject=Music Submission – [Artist]',
        bestTime: 'Monday and Tuesday',
        tip: 'Key station for Durban and KwaZulu-Natal reach. Gqom and Afro House do especially well here.',
      },
    ],
    quickWins: [
      { action: 'Register with SAMRO before any radio submission', url: 'https://samro.org.za', label: 'Register with SAMRO' },
      { action: 'Apply for RISA certification', url: 'https://risa.org.za', label: 'Apply to RISA' },
      { action: 'Submit music video to Channel O', url: 'https://www.channelo.tv/submissions', label: 'Submit to Channel O' },
      { action: 'Apply for Apple Music Africa Rising', url: 'https://artists.apple.com', label: 'Apple Music for Artists' },
      { action: 'Submit to Boomplay SA editorial', url: 'mailto:za@boomplay.com?subject=Editorial Submission – SA Artist', label: 'Email Boomplay SA' },
      { action: 'Pitch to Spotify for Artists', url: 'https://artists.spotify.com/pitch', label: 'Pitch on Spotify' },
    ],
  },
}

const PLATFORM_COLORS: Record<string, string> = {
  Audiomack: '#f97316',
  Spotify:   '#1db954',
  Boomplay:  '#e11d48',
  YouTube:   '#dc2626',
}

const CONTACT_ICONS: Record<string, string> = {
  email:     '✉',
  twitter:   '𝕏',
  instagram: '📸',
  portal:    '🔗',
  spotify:   '🎵',
}

type Section = 'playlists' | 'blogs' | 'radio' | 'quickwins'

interface Props { market: Market }

export default function MusicPromotionGuide({ market }: Props) {
  const { data: session } = useSession()
  const [section, setSection] = useState<Section>('playlists')
  const [copied, setCopied]   = useState<string | null>(null)

  const data      = DATA[market]
  const artistName = (session?.user as any)?.stageName || session?.user?.name || 'Your Name'

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  // Pre-fill email with artist name
  function buildEmailUrl(base: string) {
    return base.replace(/\[Artist( Name)?\]/g, artistName)
  }

  const sectionTabs: { id: Section; label: string; count: number }[] = [
    { id: 'playlists', label: '🎵 Playlists',  count: data.playlists.length },
    { id: 'blogs',     label: '📝 Blogs',       count: data.blogs.length },
    { id: 'radio',     label: '📻 Radio',       count: data.radio.length },
    { id: 'quickwins', label: '⚡ Quick Wins',  count: data.quickWins.length },
  ]

  return (
    <div style={{ fontFamily: 'sans-serif' }}>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a2316', marginBottom: 4 }}>
          {market} Promotion Guide
        </h3>
        <p style={{ fontSize: 13, color: '#6b6b6b', margin: 0, lineHeight: 1.5 }}>
          Real contacts you can reach right now. Every button opens the actual channel — email, DM, or submission portal.
        </p>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
        {sectionTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSection(t.id)}
            style={{
              padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', border: 'none',
              background: section === t.id ? '#0a2316' : '#f0ede8',
              color: section === t.id ? '#f9f5ec' : '#555',
            }}
          >
            {t.label} <span style={{ opacity: 0.55, fontSize: 11 }}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* ── PLAYLISTS ── */}
      {section === 'playlists' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, color: '#9b9b9b', marginBottom: 4 }}>
            Submit before release day. Click the action button to open the contact directly.
          </p>
          {data.playlists.map((p, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #ede8dc', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0a2316' }}>{p.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: PLATFORM_COLORS[p.platform] + '18', color: PLATFORM_COLORS[p.platform] }}>
                      {p.platform}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#9b9b9b' }}>👥 {p.followers}</span>
                    <span style={{ fontSize: 11, color: '#9b9b9b' }}>🎵 {p.genre}</span>
                    <span style={{ fontSize: 11, color: '#9b9b9b' }}>⏱ {p.responseTime}</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 12, color: '#444', lineHeight: 1.6, marginBottom: 12 }}>
                <strong style={{ color: '#0a2316' }}>How:</strong> {p.how}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <a
                  href={buildEmailUrl(p.contactUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 8, border: 'none',
                    background: '#0a2316', color: '#f9f5ec',
                    fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {CONTACT_ICONS[p.contactType]} {p.contactType === 'portal' ? 'Open Portal' : p.contactType === 'spotify' ? 'Pitch on Spotify' : `Contact ${p.contact}`}
                </a>
                <button
                  onClick={() => copy(p.contact, `pl-${i}`)}
                  style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #ede8dc', background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer' }}
                >
                  {copied === `pl-${i}` ? '✓ Copied' : 'Copy handle'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BLOGS ── */}
      {section === 'blogs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, color: '#9b9b9b', marginBottom: 4 }}>
            Press coverage builds label credibility. Click "Send email" — your email client opens with a pre-filled subject line.
          </p>
          {data.blogs.map((b, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #ede8dc', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0a2316' }}>{b.name}</span>
                {b.submitUrl && (
                  <a href={b.submitUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#c9922a', marginLeft: 8, textDecoration: 'none' }}>
                    Visit site ↗
                  </a>
                )}
              </div>
              <p style={{ fontSize: 12, color: '#6b6b6b', marginBottom: 10 }}>{b.focus}</p>

              <div style={{ background: '#fef9f0', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
                  💡 <strong>Tip:</strong> {b.tip}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a
                  href={buildEmailUrl(`mailto:${b.email}?subject=${encodeURIComponent(b.emailSubject.replace('[Artist Name]', artistName).replace('[Artist]', artistName))}`)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, background: '#0a2316', color: '#f9f5ec', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                >
                  ✉ Send email to {b.name}
                </a>
                <button
                  onClick={() => copy(b.email, `blog-${i}`)}
                  style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #ede8dc', background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer' }}
                >
                  {copied === `blog-${i}` ? '✓ Copied' : 'Copy email'}
                </button>
                {b.twitterUrl && (
                  <a
                    href={b.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid #ede8dc', background: '#fff', color: '#333', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                  >
                    𝕏 DM {b.twitter}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── RADIO ── */}
      {section === 'radio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, color: '#9b9b9b', marginBottom: 4 }}>
            Send WAV files, not MP3s. Click "Send email" — your email client opens pre-filled. Follow up after 5 days.
          </p>
          {data.radio.map((r, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #ede8dc', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0a2316' }}>{r.name}</span>
                <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#9b9b9b' }}>📍 {r.city}</span>
                  {r.show && <span style={{ fontSize: 11, color: '#9b9b9b' }}>🎙 {r.show}</span>}
                  {r.bestTime && <span style={{ fontSize: 11, color: '#c9922a', fontWeight: 600 }}>⏰ Best: {r.bestTime}</span>}
                </div>
              </div>

              <div style={{ background: '#fef9f0', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.6 }}>💡 {r.tip}</p>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a
                  href={buildEmailUrl(r.contactUrl)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, background: '#0a2316', color: '#f9f5ec', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                >
                  ✉ Send email to {r.name}
                </a>
                <button
                  onClick={() => copy(r.contact, `radio-${i}`)}
                  style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #ede8dc', background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer' }}
                >
                  {copied === `radio-${i}` ? '✓ Copied' : 'Copy email'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── QUICK WINS ── */}
      {section === 'quickwins' && (
        <div>
          <p style={{ fontSize: 12, color: '#9b9b9b', marginBottom: 14 }}>
            High-impact actions you can take right now. Each button takes you directly there.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.quickWins.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, background: '#fff', border: '1px solid #ede8dc', borderRadius: 12, padding: '14px 16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 200 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#0a2316', color: '#c9922a', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 13, color: '#333', lineHeight: 1.5, margin: 0 }}>{w.action}</p>
                </div>
                <a
                  href={buildEmailUrl(w.url)}
                  target={w.url.startsWith('mailto') ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#c9922a', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {w.label} →
                </a>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, background: '#0a2316', borderRadius: 12, padding: '16px 18px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#c9922a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Remember</p>
            <p style={{ fontSize: 13, color: 'rgba(249,245,236,.7)', margin: 0, lineHeight: 1.6 }}>
              One viral week won't get you a deal — 3 months of steady upward momentum will. Release every 6–8 weeks and promote each track for at least 4 weeks after drop.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
