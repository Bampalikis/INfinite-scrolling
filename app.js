let currentPage = 1;
const limit = 5;
let total = 0;
const feedEl = document.querySelector('.feed');
const loader = document.querySelector('.loader');
let isLoading = false;

//API ofr the titles, bodies, comments, and names


//ADD FAKER


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

 //Gets posts from the api  title, body, and username from hardoded array
const getPosts = async (page, limit) => {
    const API_URL = `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`;
    const response = await fetch(API_URL);

    if (!response.ok) {
       //throw new Error(`An error occurred: ${response.status}`);
        console.log('An error occurred: ${response.status}');
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

 // same as above for the comments name emalia and body

const getComments = async (postId) => {
    const API_URL = `https://jsonplaceholder.typicode.com/posts/${postId}/comments`;
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`An error occurred: ${response.status}`);
    }

    const comments = await response.json();

// Comments must be between 2 and 12

    const randomCommentCount = Math.floor(Math.random() * 11) + 2; 
    return comments.slice(0, randomCommentCount).map(comment => {
        const randomName = getRandomEnglishName();
        return {
            ...comment,
            name: randomName,
            email: generateEmailFromName(randomName),
            body: getRandomEnglishComment()
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
    maxPosts=1000;

    try {
        const posts = await getPosts(page, limit);
        showPosts(posts);

        // Remove older posts if they exceed the maxPosts limit
        const currentPosts = feedEl.querySelectorAll('.post');
        if (currentPosts.length > maxPosts) {
            const excessPosts = currentPosts.length - maxPosts;
            for (let i = 0; i < excessPosts; i++) {
                feedEl.removeChild(currentPosts[i]);
            }
        }

       // total = 1000; // Assume 100 posts for demo  
       // //remove
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
