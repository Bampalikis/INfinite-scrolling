let currentPage = 1; 
const limit = 5; 
let total = 0; 
const feedEl = document.querySelector('.feed'); 
const loader = document.querySelector('.loader'); 
let isLoading = false; 
let reachedEnd = false; 

// Keep track of the posts currently displayed in the feed
let postsInFeed = [];

// Hardcoded comments data
const hardcodedComments = [
    [ 
        { name: "Alice", email: "alice@example.com", body: "Great post!" },
        { name: "Bob", email: "bob@example.com", body: "I agree!" },
        { name: "Charlie", email: "charlie@example.com", body: "Interesting perspective." }
    ],
    [ 
        { name: "David", email: "david@example.com", body: "This is helpful." },
        { name: "Eve", email: "eve@example.com", body: "Thanks for sharing." }
    ],
    [ 
        { name: "Frank", email: "frank@example.com", body: "I learned something new." },
        { name: "Grace", email: "grace@example.com", body: "Well written." },
        { name: "Henry", email: "henry@example.com", body: "I have a question..." }
    ],
    // Add more comment sets
];

// Generates a random timestamp string like "X days ago"
const generateTimestamp = () => {
    const daysAgo = Math.floor(Math.random() * 10) + 1;
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
};

// Fetches posts from the API
const Posts = async (page, limit) => {
    try {
        const API_URL = `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`;
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch posts. Status: ${response.status}`);
        }

        const posts = await response.json();
        // Add random likes to each post
        return posts.map(post => ({
            ...post,
            likes: Math.floor(Math.random() * 50) + 5
        }));

    } catch (error) {
        console.error("Error fetching posts:", error);
        return []; // Return an empty array if there's an error
    }
};

// Fetches a random user from the API
const Users = async () => {
    try {
        const API_URL = "https://randomuser.me/api/";
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch user data. Status: ${response.status}`);
        }
        const data = await response.json();

        const user = data.results[0];
        return {
            username: `${user.name.first} ${user.name.last}`,
            email: user.email
        };
    } catch (error) {
        console.error("Error fetching user data:", error);
        // Return a default user if there's an error
        return { username: "Unknown User", email: "unknown@example.com" };
    }
};


// Simulates fetching comments for a given post ID
const getComments = async (postId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const comments = hardcodedComments[(postId - 1) % hardcodedComments.length] || [];
    return comments;
};


// Displays the posts in the feed
const showPosts = async (posts) => {
    for (const post of posts) {
        try {
            const { username } = await Users(); // Get a random user for the post
            const postEl = document.createElement('div');
            postEl.classList.add('post');
            postEl.innerHTML = `
                <div class="user">
                    <img src="https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70) + 1}" alt="User Avatar">
                    <div class="user-info">
                        <span class="username">${username}</span>
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

            const likeBtn = postEl.querySelector('.like-btn');
            const commentBtn = postEl.querySelector('.comment-btn');

            likeBtn.addEventListener('click', () => handleLike(likeBtn));
            commentBtn.addEventListener('click', () => handleComments(post.id));
        } catch (error) {
            console.error("Error creating or adding post:", error);
        }
    }
};


// Handles like button clicks
const handleLike = (button) => {
    const postEl = button.closest('.post'); 
    let likes = parseInt(button.dataset.likes, 10); // Get current like count

    if (button.dataset.liked === "true") { // Unlike the post
        likes--;
        button.dataset.liked = "false";
        button.innerHTML = `❤️ ${likes} Likes`;
        button.dataset.likes = likes;
        postEl.classList.remove('liked');
    } else { // Like the post
        likes++;
        button.dataset.liked = "true";
        button.innerHTML = `❤️ ${likes} Likes`;
        button.dataset.likes = likes;
        postEl.classList.add('liked');
    }
};

// Handles comment button clicks
const handleComments = async (postId) => {
    const commentsEl = document.getElementById(`comments-${postId}`);

    // Toggle comments visibility
    if (commentsEl.innerHTML) {
        commentsEl.innerHTML = ''; // Clear comments if already shown
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

// Show/hide the loader
const hideLoader = () => loader.classList.remove('show');
const showLoader = () => loader.classList.add('show');

// Removes a specified number of posts from the feed (oldest first)
const removeExcessPosts = (count) => {
    for (let i = 0; i < count; i++) {
        const postEl = feedEl.querySelector('.post');
        if (postEl) {
            feedEl.removeChild(postEl);
        }
        postsInFeed.shift(); // Remove from the tracking array as well
    }
};

// Loads and displays posts
const loadPosts = async (page, limit) => {
    showLoader(); // Show the loading indicator
    isLoading = true; // Prevent further loading requests while loading

    try {
        const posts = await Posts(page, limit);

        // Handle the case where there are no more posts to load
        if (posts.length === 0) {
            reachedEnd = true;
            console.log("No more posts to load.");
            return;
        }

        await showPosts(posts); 
        postsInFeed.push(...posts); // Add the new posts to the tracking array

        // Limit the number of posts in the feed to 20, removing older posts if necessary
        if (postsInFeed.length > 20) {
            removeExcessPosts(5);
        }


        total = 100; // This is a placeholder

    } catch (error) {
        console.error(error.message);
    } finally {
        hideLoader(); // Hide the loader regardless of success or failure
        isLoading = false; // Allow further loading requests
    }
};


// Handles scrolling and triggers loading more posts when near the bottom
const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    // Check if the user has scrolled near the bottom of the page
    if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading && !reachedEnd) {
        currentPage++;
        loadPosts(currentPage, limit);
    }
};


// Attach scroll listener
window.addEventListener('scroll', handleScroll, { passive: true });

// Initial load of posts
loadPosts(currentPage, limit);
