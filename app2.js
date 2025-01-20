// Import Faker (Assuming you're using a module bundler or CDN)
// If using a CDN, include the script: <script src="https://cdn.jsdelivr.net/npm/@faker-js/faker/dist/faker.umd.min.js"></script>
// If using a module bundler, install Faker: npm install @faker-js/faker

const { faker } = window.faker; // For CDN usage. Remove this line if using npm.

let currentPage = 1; 
const limit = 5;
let total = 0;
const feedEl = document.querySelector('.feed');
const loader = document.querySelector('.loader');
let isLoading = false;

// Helper functions to generate random data using Faker.js
const getRandomTitle = () => faker.lorem.sentence();
const getRandomBody = () => faker.lorem.paragraph();
const getRandomComment = () => faker.lorem.sentence();
const getRandomName = () => faker.name.fullName();
const generateEmailFromName = (name) => faker.internet.email();
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
        title: getRandomTitle(),
        body: getRandomBody(),
        username: getRandomName(),
        likes: Math.floor(Math.random() * 50) + 5
    }));
};

const getComments = async (postId) => {
    const API_URL = `https://jsonplaceholder.typicode.com/posts/${postId}/comments`;
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`An error occurred: ${response.status}`);
    }

    const comments = await response.json();

    const randomCommentCount = Math.floor(Math.random() * 11) + 2; // Comments must be between 2 and 12
    return comments.slice(0, randomCommentCount).map(comment => {
        const randomName = getRandomName();
        return {
            ...comment,
            name: randomName,
            email: generateEmailFromName(randomName),
            body: getRandomComment()
        };
    });
};

// Posts
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
        const commentBtn = postEl.querySelector('.comment-btn');
        const reactions = postEl.querySelector('.reactions');

        likeBtn.addEventListener('click', () => handleLike(likeBtn));
        commentBtn.addEventListener('click', () => handleComments(post.id));
        reactions.addEventListener('click', (event) => handleReaction(event.target));
    });
};

// Like interaction
const handleLike = (button) => {
    const postEl = button.closest('.post');
    let likes = parseInt(button.dataset.likes, 10);

    if (button.dataset.liked === "true") {
        // Unlike the post
        likes--;
        button.dataset.liked = "false";
        button.innerHTML = `❤️ ${likes} Likes`;
        button.dataset.likes = likes;
        postEl.classList.remove('liked'); // Remove goldish effect
    } else {
        // Like the post
        likes++;
        button.dataset.liked = "true";
        button.innerHTML = `❤️ ${likes} Likes`;
        button.dataset.likes = likes;
        postEl.classList.add('liked'); // Add goldish effect
    }
};

// Reaction interaction
const handleReaction = (emoji) => {
    if (emoji.tagName === 'DIV') return;
    emoji.classList.toggle('selected');
};

// Display comments
const handleComments = async (postId) => {
    const commentsEl = document.getElementById(`comments-${postId}`);

    if (commentsEl.innerHTML) {
        commentsEl.innerHTML = '';
        return;
    }

    try {
        const comments = await getComments(postId);

        comments.forEach(comment => {
            const commentEl = document.createElement('div');
            commentEl.classList.add('comment');
            commentEl.innerHTML = `
                <p><strong>${comment.name}</strong> (${comment.email}):</p>
                <p>${comment.body}</p>
            `;
            commentsEl.appendChild(commentEl);
        });
    } catch (error) {
        console.error('Failed to load comments:', error.message);
    }
};

// Show/hide loader
const hideLoader = () => loader.classList.remove('show');
const showLoader = () => loader.classList.add('show');

// Load posts on scroll
const loadPosts = async (page, limit) => {
    showLoader();
    isLoading = true;

    try {
        const posts = await getPosts(page, limit);
        showPosts(posts);
        total = 100; // Assume 100 posts for demo
    } catch (error) {
        console.error(error.message);
    } finally {
        hideLoader();
        isLoading = false;
    }
};

// Handle infinite scroll
const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
        currentPage++;
        loadPosts(currentPage, limit);
    }
};

window.addEventListener('scroll', handleScroll, { passive: true });
loadPosts(currentPage, limit);
