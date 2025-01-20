let currentPage = 1;
const limit = 5;
const feedEl = document.querySelector('.feed');
const loader = document.querySelector('.loader');
let isLoading = false;

// Track the posts in the feed
let postsInFeed = [];

// API for the titles, bodies, comments, and names
const englishTitles = [
    "Exploring the World of Programming",
    "Why Cats Are the Best Pets",
    "Top 10 Travel Destinations",
    "How to Build a Social Media App",
    "The Art of Minimalism",
    "Tips for Growing a Thriving Garden",
    "The Future of Artificial Intelligence",
    "10 Life Hacks You Need to Try Today",
    "Understanding Quantum Physics for Beginners",
    "The Ultimate Guide to Personal Finance",
    "A Deep Dive into Space Exploration",
    "How Music Impacts Your Mood",
    "The Science of Happiness",
    "The Magic of Baking: Simple Recipes",
    "Beginner’s Guide to Meditation"
];

const englishBodies = [
    "This is a wonderful day to learn something new and exciting.",
    "Have you ever wondered how things work in the digital world?",
    "Taking a moment to appreciate the little joys in life.",
    "Remember, every expert was once a beginner.",
    "Consistency is the key to success in any field.",
    "Explore the beauty of nature and its calming effects.",
    "Discover the secrets to a more productive day.",
    "Unlock the mysteries of the universe one step at a time.",
    "Learn how to master the art of time management.",
    "Simple changes can lead to extraordinary results.",
    "Innovation is at the heart of progress.",
    "How small habits can create big impacts over time.",
    "Discover the joy of cooking with simple ingredients.",
    "Embrace mindfulness and live in the moment.",
    "A step-by-step guide to creating meaningful connections."
];

const englishComments = [
    "This is such a great post!",
    "Thank you for sharing this information.",
    "I completely agree with your points.",
    "This really made me think about things differently.",
    "What a fantastic way to explain this topic!",
    "Your insights are incredibly valuable.",
    "I learned so much from this!",
    "Keep up the amazing work!",
    "This was very well-written and insightful.",
    "I’m definitely bookmarking this for later.",
    "Amazing content, can’t wait for more.",
    "This just made my day better, thank you!",
    "So relevant and on-point, love it!",
    "This is exactly what I needed right now.",
    "Great perspective, well done!"
];

const englishNames = [
    "Alice Johnson", "Bob Smith", "Carol White", "David Brown", "Eve Adams",
    "Frank Miller", "Grace Lee", "Hank Martin", "Isla Davis", "Jack Wilson",
    "Karen Taylor", "Leo Garcia", "Mona Clark", "Nina Scott", "Oscar Wright",
    "Paul Green", "Quincy Black", "Rachel Hunter", "Steve Carter", "Tina Holmes"
];

const getRandomEnglishTitle = () => englishTitles[Math.floor(Math.random() * englishTitles.length)];
const getRandomEnglishBody = () => englishBodies[Math.floor(Math.random() * englishBodies.length)];
const getRandomEnglishComment = () => englishComments[Math.floor(Math.random() * englishComments.length)];
const getRandomEnglishName = () => englishNames[Math.floor(Math.random() * englishNames.length)];
const generateEmailFromName = (name) => {
    const emailName = name.toLowerCase().replace(" ", ".");
    return `${emailName}@example.com`;
};
const generateTimestamp = () => {
    const daysAgo = Math.floor(Math.random() * 10) + 1;
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
};

const getPosts = async (page, limit) => {
    const API_URL = `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`;
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`An error occurred: ${response.status}`);
    }

    const posts = await response.json();

    return posts.map(post => ({
        ...post,
        title: getRandomEnglishTitle(),
        body: getRandomEnglishBody(),
        username: getRandomEnglishName(),
        likes: Math.floor(Math.random() * 50) + 5
    }));
};

const showPosts = (posts) => {
    posts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.classList.add('post');
        postEl.innerHTML = `
            <div class="user">
                <img src="https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70) + 1}" alt="User Avatar">
                <div class="user-info">
                    <span class="username">${post.username}</span>
                    <span class="timestamp">${generateTimestamp()}</span>
                </div>
            </div>
            <div class="content">
                <h3>${post.title}</h3>
                <p>${post.body}</p>
            </div>
            <div class="interactions">
                <button class="like-btn" data-likes="${post.likes}" data-liked="false">❤️ ${post.likes} Likes</button>
                <div class="reactions">
                    🥳 😍 😢 🤔 👍
                </div>
                <button class="comment-btn" data-id="${post.id}">💬 View Comments</button>
            </div>
            <div class="comments" id="comments-${post.id}"></div>
        `;
        feedEl.appendChild(postEl);

        const likeBtn = postEl.querySelector('.like-btn');
        likeBtn.addEventListener('click', () => handleLike(likeBtn));
    });
};

const handleLike = (button) => {
    const postEl = button.closest('.post');
    let likes = parseInt(button.dataset.likes, 10);

    if (button.dataset.liked === "true") {
        likes--;
        button.dataset.liked = "false";
        button.innerHTML = `❤️ ${likes} Likes`;
    } else {
        likes++;
        button.dataset.liked = "true";
        button.innerHTML = `❤️ ${likes} Likes`;
    }
};

// Remove excess posts
const removeExcessPosts = (count) => {
    for (let i = 0; i < count; i++) {
        const postEl = feedEl.querySelector('.post');
        if (postEl) {
            feedEl.removeChild(postEl);
        }
        postsInFeed.shift();
    }
};

const loadPosts = async (page, limit) => {
    showLoader();
    isLoading = true;

    try {
        const posts = await getPosts(page, limit);
        showPosts(posts);
        postsInFeed.push(...posts);

        if (postsInFeed.length > 200) {
            removeExcessPosts(5);
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        hideLoader();
        isLoading = false;
    }
};

const hideLoader = () => loader.classList.remove('show');
const showLoader = () => loader.classList.add('show');

const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
        currentPage++;
        loadPosts(currentPage, limit);
    }
};

window.addEventListener('scroll', handleScroll, { passive: true });
loadPosts(currentPage, limit);
