import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

// Scrape live matches from Cricbuzz
app.get('/api/cricket/live-matches', async (req, res) => {
  try {
    console.log('📡 Fetching live matches from Cricbuzz...');
    
    const response = await axios.get('https://m.cricbuzz.com/cricket-match/live-scores', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    const $ = cheerio.load(response.data);
    const matches = [];

    console.log('🔍 Parsing HTML with new selectors...');

    // Method 1: Look for links in the top nav (from debug output)
    $('a[href*="live-cricket-scores"]').each((index, element) => {
      const $link = $(element);
      const matchLink = $link.attr('href') || '';
      const matchText = cleanText($link.text());
      
      // Parse text like "IND vs WI - Need 70 to win"
      if (matchText.includes(' vs ')) {
        const parts = matchText.split(' vs ');
        if (parts.length >= 2) {
          const team1 = parts[0].trim();
          const restText = parts[1];
          
          // Extract team2 and status
          let team2 = '';
          let status = '';
          
          if (restText.includes(' - ')) {
            const splitRest = restText.split(' - ');
            team2 = splitRest[0].trim();
            status = splitRest.slice(1).join(' - ').trim();
          } else {
            team2 = restText.trim();
            status = 'Check Cricbuzz';
          }
          
          const matchId = matchLink.split('/')[2] || `match-${Date.now()}-${index}`;
          
          // Determine if live
          const isLive = status.toLowerCase().includes('need') ||
                        status.toLowerCase().includes('trail') ||
                        status.toLowerCase().includes('lead') ||
                        status.toLowerCase().includes('opt to') ||
                        status.toLowerCase().includes('batting') ||
                        status.toLowerCase().includes('stumps') ||
                        !status.toLowerCase().includes('won');

          matches.push({
            id: matchId,
            team1: team1,
            team2: team2,
            score1: 'Live Score',
            score2: 'Live Score',
            status: status,
            matchInfo: 'Live Cricket Match',
            isLive: isLive,
            matchType: 'Cricket',
            link: matchLink.startsWith('http') ? matchLink : `https://m.cricbuzz.com${matchLink}`
          });

         // console.log(`✅ Found: ${team1} vs ${team2} - ${status}`);
        }
      }
    });

    // Method 2: Traditional card scraping (backup)
    if (matches.length === 0) {
      console.log('🔄 Trying traditional card scraping...');
      
      $('.cb-mtch-crd, .cb-col-100.cb-col, .cb-mtch-lst-itm').each((index, element) => {
        const $card = $(element);
        
        const team1 = $card.find('.cb-hmscg-tm-nm').eq(0).text().trim() || 
                     $card.find('.cb-ovr-flo').eq(0).text().trim();
        const team2 = $card.find('.cb-hmscg-tm-nm').eq(1).text().trim() || 
                     $card.find('.cb-ovr-flo').eq(1).text().trim();
        const score1 = $card.find('.cb-hmscg-bat-txt').eq(0).text().trim();
        const score2 = $card.find('.cb-hmscg-bat-txt').eq(1).text().trim();
        const matchStatus = $card.find('.cb-text-complete, .cb-text-live, .cb-text-inprogress').text().trim();
        
        const matchLink = $card.find('a').first().attr('href') || '';
        const matchId = matchLink.split('/')[2] || `card-${index}`;
        
        if (team1 && team2 && team1.length > 2 && team2.length > 2) {
          const isLive = $card.find('.cb-text-live, .cb-text-inprogress').length > 0;
          
          matches.push({
            id: matchId,
            team1: cleanText(team1),
            team2: cleanText(team2),
            score1: score1 || 'Yet to bat',
            score2: score2 || 'Yet to bat',
            status: matchStatus || 'Scheduled',
            matchInfo: 'Cricket Match',
            isLive: isLive,
            matchType: 'Cricket',
            link: `https://m.cricbuzz.com${matchLink}`
          });
          
          console.log(`✅ Card found: ${team1} vs ${team2}`);
        }
      });
    }

    console.log(`📊 Total matches found: ${matches.length}`);

    // Remove duplicates
    const uniqueMatches = [];
    const seenIds = new Set();
    
    for (const match of matches) {
      if (!seenIds.has(match.id)) {
        seenIds.add(match.id);
        uniqueMatches.push(match);
      }
    }

    res.json({ 
      success: true, 
      matches: uniqueMatches.slice(0, 20),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error scraping cricket data:', error.message);
    
    res.json({ 
      success: true, 
      matches: [{
        id: 'sample-1',
        team1: 'India',
        team2: 'Australia',
        score1: '328/5 (50)',
        score2: '286/9 (50)',
        status: 'India won by 42 runs',
        matchInfo: 'Sample Match',
        isLive: false,
        matchType: 'International',
        link: 'https://m.cricbuzz.com'
      }],
      note: 'Sample data - API error',
      error: error.message
    });
  }
});

// Get match details
app.get('/api/cricket/match/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    console.log(`📡 Fetching details for match: ${matchId}`);
    
    const response = await axios.get(`https://m.cricbuzz.com/live-cricket-scores/${matchId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    const matchDetails = {
      id: matchId,
      title: $('.cb-nav-main, .cb-nav-hdr, h1').first().text().trim(),
      status: $('.cb-text-inprogress, .cb-text-live, .cb-text-complete, .cb-text-gray').first().text().trim(),
      venue: $('.cb-nav-subhdr, .cb-font-12, .cb-venue').first().text().trim(),
      teams: [],
      commentary: []
    };

    // Get team scores
    $('.cb-col.cb-col-100.cb-ltst-wgt-hdr, .cb-scr-wll-chvrn, .cb-min-itm').each((i, elem) => {
      const $elem = $(elem);
      const teamName = $elem.find('.cb-col-84, .inline-block, .cb-hmscg-tm-nm').first().text().trim();
      const score = $elem.find('.cb-col-84, .inline-block, .cb-hmscg-bat-txt').eq(1).text().trim();
      
      if (teamName && score && teamName.length > 2) {
        matchDetails.teams.push({ name: cleanText(teamName), score: cleanText(score) });
      }
    });

    // Get commentary
    $('.cb-col.cb-col-90.cb-comm-ln, .cb-com-ln, .cb-col.cb-col-100.cb-com-ln').slice(0, 10).each((i, elem) => {
      const $elem = $(elem);
      const over = $elem.find('.cb-col-8, .cb-font-12').first().text().trim();
      const comment = cleanText($elem.text());
      
      if (comment && comment.length > 10) {
        matchDetails.commentary.push({ over, comment });
      }
    });

    console.log(`✅ Found ${matchDetails.teams.length} teams, ${matchDetails.commentary.length} comments`);

    res.json({ success: true, match: matchDetails });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recent matches endpoint
app.get('/api/cricket/recent-matches', async (req, res) => {
  try {
    console.log('📡 Fetching recent matches...');
    
    const response = await axios.get('https://m.cricbuzz.com/cricket-match/live-scores', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const matches = [];

    // Get all matches (live and recent)
    $('a[href*="live-cricket-scores"]').each((index, element) => {
      const $link = $(element);
      const matchLink = $link.attr('href') || '';
      const matchText = cleanText($link.text());
      
      if (matchText.includes(' vs ')) {
        const parts = matchText.split(' vs ');
        if (parts.length >= 2) {
          const team1 = parts[0].trim();
          const restText = parts[1];
          
          let team2 = '';
          let status = '';
          
          if (restText.includes(' - ')) {
            const splitRest = restText.split(' - ');
            team2 = splitRest[0].trim();
            status = splitRest.slice(1).join(' - ').trim();
          } else {
            team2 = restText.trim();
          }
          
          const matchId = matchLink.split('/')[2] || `match-${index}`;

          matches.push({
            id: matchId,
            team1: team1,
            team2: team2,
            score1: 'View Scores',
            score2: 'View Scores',
            status: status || 'Scheduled',
            matchInfo: 'Cricket Match',
            isLive: false,
            matchType: 'Recent',
            link: `https://m.cricbuzz.com${matchLink}`
          });
        }
      }
    });

    res.json({ success: true, matches: matches.slice(0, 15) });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Cricket Scraper API is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint with mock data
app.get('/api/cricket/test', (req, res) => {
  res.json({
    success: true,
    matches: [
      {
        id: 'test-1',
        team1: 'India',
        team2: 'West Indies',
        score1: 'Need 70 to win',
        score2: 'Live Score',
        status: 'IND need 70 runs',
        matchInfo: 'Test Match',
        isLive: true,
        matchType: 'Test',
        link: 'https://m.cricbuzz.com'
      },
      {
        id: 'test-2',
        team1: 'Pakistan',
        team2: 'South Africa',
        score1: 'Trail by 186',
        score2: 'Live Score',
        status: 'PAK trail by 186 runs',
        matchInfo: 'Test Match',
        isLive: true,
        matchType: 'Test',
        link: 'https://m.cricbuzz.com'
      },
      {
        id: 'test-3',
        team1: 'Bangladesh Women',
        team2: 'South Africa Women',
        score1: 'BANW opt to bat',
        score2: 'Live Score',
        status: 'BANW elected to bat',
        matchInfo: 'ODI',
        isLive: true,
        matchType: 'ODI',
        link: 'https://m.cricbuzz.com'
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🏏 Cricket Scraper API running on http://localhost:${PORT}`);
  console.log(`📍 Test: http://localhost:${PORT}/api/cricket/test`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 Live: http://localhost:${PORT}/api/cricket/live-matches`);
});