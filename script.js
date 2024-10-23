const reposContainer = document.getElementById('repos');
const loadMoreButton = document.getElementById('loadMore');
const loader = document.getElementById('dots');
const twitchIframe = document.querySelector('.twitch-embed iframe');
const twitchDots = document.querySelector('#twitch-dots');
const youtubeIframe = document.querySelector('.youtube-embed iframe');
const youtubeDots = document.querySelector('#youtube-dots');
const imageButtons = document.querySelectorAll('.image-button');
const altImageContainer = document.querySelector('.alt-image-container');

twitchIframe.addEventListener('load', () => {
  twitchDots.style.display = 'none';
});

youtubeIframe.addEventListener('load', () => {
  youtubeDots.style.display = 'none';
});

imageButtons.forEach((button, index) => {
  button.addEventListener('mouseover', () => {
    const currentImage = altImageContainer.querySelector('img');
    const newImageSrc = `../Images/scr/pics/alt ${index + 1}.png`;
    if (currentImage && currentImage.src.includes(newImageSrc.split('/').pop())) {
      return;
    }
    altImageContainer.innerHTML = '';
    const altImage = document.createElement('img');
    altImage.src = newImageSrc;
    altImage.alt = `Alt ${index + 1}`;
    altImage.classList.add('alt-image');
    altImageContainer.appendChild(altImage);
  });
}); 

const buttons = document.querySelectorAll('.rounded-button');
const descriptions = document.querySelectorAll('.button-description');

buttons.forEach((button, index) => {
  button.addEventListener('click', () => {
    // Hide all descriptions
    descriptions.forEach((description) => {
      description.classList.add('hidden');
    });
    // Show the description for the clicked button
    descriptions[index].classList.remove('hidden');
    // Remove active class from all buttons
    buttons.forEach((b) => b.classList.remove('active'));
    // Add active class to the clicked button
    button.classList.add('active');
  });
});

let currentPage = 1;
const repoWidth = 380; // Adjust this value based on the actual width of each repo item
const perPage = Math.floor(window.innerWidth / repoWidth); // Calculate number of repos that fit on screen horizontally

// Function to fetch repositories
async function fetchRepositories(page, perPage) {
    const url = `https://api.github.com/users/IlRando/repos?per_page=${perPage}&page=${page}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        alert('Failed to fetch repositories. Please try again later.');
        return [];
    }
}

// Function to display repositories one by one
async function displayRepositories(repos) {
    const repoDivs = repos.map(repo => {
        const repoDiv = document.createElement('div');
        repoDiv.classList.add('repo');

        // Wrap the entire repoDiv in an anchor tag
        const anchor = document.createElement('a');
        anchor.href = repo.html_url; // Set the link to the repository URL
        anchor.target = "_blank"; // Open in a new tab
        anchor.appendChild(repoDiv); // Append the repoDiv to the anchor

        const repoName = document.createElement('h2');
        const nameWithoutPrefix = repo.full_name.replace(/^IlRando\//, '');
        repoName.textContent = nameWithoutPrefix; // Use textContent for safety

        const repoImage = document.createElement('img');
        repoImage.src = `${repo.html_url}/raw/main/Cover.png`; // Adjust the path if necessary
        repoImage.alt = `${nameWithoutPrefix} Cover Image`;
        repoImage.classList.add('repo-cover'); // Add a class for styling

        const repoDesc = document.createElement('p');
        repoDesc.textContent = repo.description || 'No description provided.';

        const repoStats = document.createElement('div'); // Change to div
        repoStats.classList.add('repo-stats'); // Add class for styling
        repoStats.innerHTML = `⭐ Stars: ${repo.stargazers_count} | 🍴 Forks: ${repo.forks_count}`;

        repoDiv.appendChild(repoName);
        repoDiv.appendChild(repoImage); 
        repoDiv.appendChild(repoDesc);
        repoDiv.appendChild(repoStats);

        reposContainer.appendChild(anchor); // Append the anchor to the container

        return repoDiv; // Return the created div
    });

    // Apply animation to each repository
    for (const repoDiv of repoDivs) {
        repoDiv.classList.add('animate'); // Add animation class
        await new Promise(resolve => setTimeout(resolve, 200)); // Adjust the delay as needed
    }
}

// Function to load repositories
async function loadRepositories() {
    loader.style.display = 'block';
    loadMoreButton.disabled = true;
  
    const repos = await fetchRepositories(currentPage, perPage);
    displayRepositories(repos);
  
    loader.style.display = 'none';
    loadMoreButton.disabled = false;
  
    // Check if there are more repositories to load
    if (repos.length < perPage) {
      loadMoreButton.style.display = 'none'; // Hide the "Load More" button
    } else {
      const totalRepos = await getTotalRepositories(); // Get the total number of repositories
      if (currentPage * perPage < totalRepos) {
        loadMoreButton.style.display = 'block'; // Show the "Load More" button
      } else {
        loadMoreButton.style.display = 'none'; // Hide the "Load More" button
      }
    }
  
    currentPage++;
  }
  
  // Function to get the total number of repositories
  async function getTotalRepositories() {
    const response = await fetch('https://api.github.com/users/IlRando/repos');
    const data = await response.json();
    return data.length;
  }

// Initial load
loadMoreButton.style.display = 'none'; // Hide the "Load More" button initially
loadRepositories(true);

// Load more on button click
loadMoreButton.addEventListener('click', loadRepositories);
