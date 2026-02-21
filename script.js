// ============================================
// StudyScout V1 — Core Logic (Figma Update)
// Follows functions.md strictly
// ============================================

const API_KEY = 'AIzaSyAinDQEKyfymL8DH4qPldK4vyXHDx9rWxk';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';

// --- Known Languages ---
const LANGUAGES = [
    'english', 'hindi', 'gujarati', 'marathi', 'tamil',
    'telugu', 'kannada', 'bengali', 'malayalam', 'punjabi',
    'urdu', 'odia', 'assamese'
];

// --- DOM Elements ---
var searchInput = document.getElementById('search-input');
var findBtn = document.getElementById('find-btn');
var resultsSection = document.getElementById('results-section');
var resultsContainer = document.getElementById('results-container');
var loadingEl = document.getElementById('loading');
var noResultsEl = document.getElementById('no-results');
var errorMessage = document.getElementById('error-message');

// --- Event Listeners ---
findBtn.addEventListener('click', handleSearch);

// Enter key in textarea triggers search (not newline)
searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSearch();
    }
});


// ============================================
// 1. INPUT PARSING (functions.md §1)
// ============================================
function parseInput(raw) {
    var input = raw.trim().toLowerCase();
    var result = { topic: '', classLevel: '', language: '', duration: null };
    var remaining = input;

    // Extract class/grade
    var classMatch = remaining.match(/(?:class|grade)\s*(\d{1,2})/i);
    if (classMatch) {
        result.classLevel = classMatch[1];
        remaining = remaining.replace(classMatch[0], '');
    }

    // Extract duration
    var durationMatch = remaining.match(/(\d{1,3})\s*(?:min|minutes?|mins)/i);
    if (durationMatch) {
        result.duration = parseInt(durationMatch[1]);
        remaining = remaining.replace(durationMatch[0], '');
    }

    // Extract language
    for (var i = 0; i < LANGUAGES.length; i++) {
        var lang = LANGUAGES[i];
        var regex = new RegExp('\\b' + lang + '\\b', 'i');
        if (regex.test(remaining)) {
            result.language = lang;
            remaining = remaining.replace(regex, '');
            break;
        }
    }

    // Everything remaining is the topic
    result.topic = remaining.replace(/\s+/g, ' ').trim();
    return result;
}


// ============================================
// 2. SEARCH QUERY FORMATION (functions.md §2)
// ============================================
function buildSearchQuery(parsed) {
    var query = parsed.topic;
    if (parsed.classLevel) query += ' class ' + parsed.classLevel;
    if (parsed.language) query += ' ' + parsed.language;
    query += ' lecture explained';
    return query;
}


// ============================================
// 3. YOUTUBE API CALLS (functions.md §3)
// ============================================
function searchYouTube(query) {
    var params = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: '20',
        safeSearch: 'strict',
        key: API_KEY
    });

    return fetch(YOUTUBE_SEARCH_URL + '?' + params)
        .then(function (response) {
            if (!response.ok) throw new Error('YouTube search failed');
            return response.json();
        })
        .then(function (data) {
            return data.items || [];
        });
}

function getVideoDetails(videoIds) {
    var params = new URLSearchParams({
        part: 'statistics,contentDetails',
        id: videoIds.join(','),
        key: API_KEY
    });

    return fetch(YOUTUBE_VIDEOS_URL + '?' + params)
        .then(function (response) {
            if (!response.ok) throw new Error('Video details fetch failed');
            return response.json();
        })
        .then(function (data) {
            return data.items || [];
        });
}


// ============================================
// 4. DURATION PARSING (ISO 8601 → minutes)
// ============================================
function parseDurationISO(iso) {
    var match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    var hours = parseInt(match[1] || 0);
    var minutes = parseInt(match[2] || 0);
    var seconds = parseInt(match[3] || 0);
    return hours * 60 + minutes + (seconds > 30 ? 1 : 0);
}


// ============================================
// 5. DURATION FILTERING (functions.md §5)
// ============================================
function filterByDuration(videos, userDuration) {
    if (userDuration) {
        var min = userDuration * 0.5;
        var max = userDuration * 1.5;
        return videos.filter(function (v) {
            return v._durationMin >= min && v._durationMin <= max;
        });
    }
    return videos.filter(function (v) {
        return v._durationMin >= 5 && v._durationMin <= 60;
    });
}


// ============================================
// 6. VIDEO RANKING (functions.md §4)
// ============================================
function rankVideos(videos, parsed) {
    var scored = videos.map(function (v) {
        var views = parseInt(v.statistics.viewCount || 0);
        var likes = parseInt(v.statistics.likeCount || 0);
        var likeRatio = views > 0 ? (likes / views) : 0;

        // PRIMARY: views + likes
        var score = views + (likes * 100);

        // SECONDARY: like-to-view ratio
        score += likeRatio * 50000;

        // SECONDARY: title relevance
        var title = (v._title || '').toLowerCase();
        var topicWords = parsed.topic.split(' ').filter(function (w) { return w.length > 2; });
        var matchCount = 0;
        for (var i = 0; i < topicWords.length; i++) {
            if (title.indexOf(topicWords[i]) !== -1) matchCount++;
        }
        score += matchCount * 10000;

        if (parsed.classLevel && title.indexOf(parsed.classLevel) !== -1) {
            score += 20000;
        }

        v._score = score;
        v._views = views;
        v._likes = likes;
        v._likeRatio = likeRatio;
        return v;
    });

    scored.sort(function (a, b) { return b._score - a._score; });
    return scored;
}


// ============================================
// 7. FORMAT NUMBERS
// ============================================
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}


// ============================================
// 8. RENDER RESULTS (Glass Pane Cards)
// ============================================
function renderResults(videos) {
    resultsContainer.innerHTML = '';

    // Find the best video by like/view ratio → featured (bigger card)
    var bestIdx = 0;
    var bestRatio = -1;
    for (var i = 0; i < videos.length; i++) {
        if (videos[i]._likeRatio > bestRatio) {
            bestRatio = videos[i]._likeRatio;
            bestIdx = i;
        }
    }

    // Rearrange: put featured in the middle (position 1)
    var featured = videos.splice(bestIdx, 1)[0];
    featured._featured = true;
    if (videos.length >= 2) {
        // [side, featured, side]
        videos.splice(1, 0, featured);
    } else {
        videos.push(featured);
    }

    for (var j = 0; j < videos.length; j++) {
        var video = videos[j];
        var videoId = video._videoId;
        var thumb = video._thumbnail;
        var title = video._title;
        var link = 'https://www.youtube.com/watch?v=' + videoId;
        var isFeatured = video._featured === true;

        var card = document.createElement('div');
        card.className = 'video-card' + (isFeatured ? ' featured' : '');

        card.innerHTML =
            '<a href="' + link + '" target="_blank" rel="noopener" class="video-thumb-link">' +
            '<img src="' + thumb + '" alt="' + title.replace(/"/g, '&quot;') + '" loading="lazy">' +
            '</a>' +
            '<div class="video-meta">' +
            '<a href="' + link + '" target="_blank" rel="noopener" class="video-title">' + title + '</a>' +
            '<div class="video-metrics">' +
            '<span>' + formatNumber(video._views) + ' views</span>' +
            '<span>' + formatNumber(video._likes) + ' likes</span>' +
            '</div>' +
            '</div>';

        resultsContainer.appendChild(card);
    }
}


// ============================================
// 9. UI STATE MANAGEMENT
// ============================================
function showLoading() {
    loadingEl.classList.add('visible');
    resultsSection.classList.remove('visible');
    noResultsEl.classList.remove('visible');
}

function hideLoading() {
    loadingEl.classList.remove('visible');
}

function showResults() {
    resultsSection.classList.add('visible');
    noResultsEl.classList.remove('visible');

    // Smooth scroll to results
    setTimeout(function () {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function showNoResults(message) {
    errorMessage.textContent = message || 'No relevant videos found. Try refining your topic.';
    noResultsEl.classList.add('visible');
    resultsSection.classList.remove('visible');
}

function resetSearch() {
    searchInput.value = '';
    resultsSection.classList.remove('visible');
    noResultsEl.classList.remove('visible');
    searchInput.focus();
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ============================================
// 10. MAIN SEARCH HANDLER
// ============================================
function handleSearch() {
    var raw = searchInput.value.trim();
    if (!raw) {
        searchInput.focus();
        return;
    }

    var parsed = parseInput(raw);
    if (!parsed.topic) {
        showNoResults('Please enter a topic to search for.');
        return;
    }

    var query = buildSearchQuery(parsed);
    showLoading();

    searchYouTube(query)
        .then(function (searchResults) {
            if (searchResults.length === 0) {
                hideLoading();
                showNoResults();
                return;
            }

            var videoIds = searchResults.map(function (v) { return v.id.videoId; });

            return getVideoDetails(videoIds)
                .then(function (details) {
                    var merged = details.map(function (d) {
                        var searchItem = null;
                        for (var i = 0; i < searchResults.length; i++) {
                            if (searchResults[i].id.videoId === d.id) {
                                searchItem = searchResults[i];
                                break;
                            }
                        }
                        d._videoId = d.id;
                        d._title = searchItem ? searchItem.snippet.title : '';
                        d._thumbnail = searchItem
                            ? (searchItem.snippet.thumbnails.medium
                                ? searchItem.snippet.thumbnails.medium.url
                                : searchItem.snippet.thumbnails.default.url)
                            : '';
                        d._durationMin = parseDurationISO(d.contentDetails.duration);
                        return d;
                    });

                    var filtered = filterByDuration(merged, parsed.duration);
                    if (filtered.length === 0) filtered = merged;

                    var ranked = rankVideos(filtered, parsed);
                    var top3 = ranked.slice(0, 3);

                    hideLoading();

                    if (top3.length === 0) {
                        showNoResults();
                    } else {
                        renderResults(top3);
                        showResults();
                    }
                });
        })
        .catch(function (err) {
            console.error('StudyScout Error:', err);
            hideLoading();
            showNoResults('Something went wrong. Please try again.');
        });
}
