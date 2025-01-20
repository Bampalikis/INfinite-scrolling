let currentPage = 1;
const limit = 5;
let total = 0;
const feedEl = document.querySelector('.feed');
const loader = document.querySelector('.loader');
let isLoading = false;

// Fetch random data from Faker API
const fetchFakerData = async (type, count = 1) => {
    const API_URL = `https://fakerapi.it/api/v1/${type}?_quantity=${count}`;
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Failed to fetch ${type}: ${response.status}`);
    const data = await response.json();
    return data.data;
};

const getPosts = async (page, limit) => {
    const posts = await fetchFakerData('posts', limit);
    return posts.map(post => ({
        ...post,
        username: post.author,
        likes: Math.floor(Math.random() * 50) + 5
    }));
};

const getComments = async (postId) => {
    const comments = await fetchFakerData('comments', Math.floor(Math.random() * 11) + 2);
    return comments.map(comment => ({
        ...comment,
        name: comment.user,
        email: comment.email
    }));
};

const generateTimestamp = () => {
    const daysAgo = Math.floor(Math.random() * 10) + 1;
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
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
                <button class="comment-btn" data-id="${post.id}">💬 View Comments</button>
            </div>
            <div class="comments" id="comments-${post.id}"></div>
        `;
        feedEl.appendChild(postEl);

        postEl.querySelector('.like-btn').addEventListener('click', (e) => handleLike(e.target));
        postEl.querySelector('.comment-btn').addEventListener('click', () => handleComments(post.id));
    });
};

const handleLike = (button) => {
    let likes = parseInt(button.dataset.likes);
    const liked = button.dataset.liked === "true";
    likes += liked ? -1 : 1;
    button.dataset.liked = (!liked).toString();
    button.innerHTML = `❤️ ${likes} Likes`;
    button.dataset.likes = likes;
};

const handleComments = async (postId) => {
    const commentsEl = document.getElementById(`comments-${postId}`);
    if (commentsEl.innerHTML) return commentsEl.innerHTML = '';

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
};

const showLoader = () => loader.classList.add('show');
const hideLoader = () => loader.classList.remove('show');

const loadPosts = async (page, limit) => {
    showLoader();
    isLoading = true;
    try {
        const posts = await getPosts(page, limit);
        showPosts(posts);
        total = 100;
    } catch (error) {
        console.error(error.message);
    } finally {
        hideLoader();
        isLoading = false;
    }
};

const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
        currentPage++;
        loadPosts(currentPage, limit);
    }
};

window.addEventListener('scroll', handleScroll, { passive: true });
loadPosts(currentPage, limit);
