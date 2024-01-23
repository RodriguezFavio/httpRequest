const listElement = document.querySelector(".posts");
const postTemplate = document.getElementById("single-post");
const form = document.querySelector("#new-post form");
const fetchButton = document.getElementById("fecth-button");
const restoreButton = document.getElementById("restore-button");
const postList = document.querySelector("ul");

let postsLoaded = false;
const deletedPostElement = [];

const sortElementById = () => {
  Array.from(listElement.children)
  .sort((a, b) => a.id - b.id)
  .forEach((element) => listElement.appendChild(element));
}

const fetchPosts = async () => {
  if (postsLoaded) {
    return;
  }

  try {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );

    const listOfPost = response.data;

    for (const post of listOfPost) {
      const postEl = document.importNode(postTemplate.content, true);
      postEl.querySelector("h2").textContent = post.title.toUpperCase();
      postEl.querySelector("p").textContent = post.body;
      postEl.querySelector("li").id = post.id;
      listElement.append(postEl);
    }
  } catch (error) {
    console.error("Error getting post: ", error.response);
  }
  postsLoaded = true;
};

const createPost = async (title, content) => {
  const userId = Math.random();
  const post = {
    title: title,
    body: content,
    userId: userId,
  };

  try {
    const response = await axios.post(
      "https://jsonplaceholder.typicode.com/posts",
      post
    );

    if (response) {
      const postEl = document.importNode(postTemplate.content, true);
      postEl.querySelector("h2").textContent = response.data.title.toUpperCase();
      postEl.querySelector("p").textContent = response.data.body;
      postEl.querySelector("li").id = response.data.userId;
      listElement.append(postEl);
      form.reset();
    } else {
      console.error("invalid response from server");
    }
  } catch (error) {
    console.error("Error creating post:", error.response);
  }
  sortElementById();
};

fetchButton.addEventListener("click", fetchPosts);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const enteredTitle = event.currentTarget.querySelector("#title").value;
  const enteredContent = event.currentTarget.querySelector("#content").value;

  if (enteredTitle.trim() === "" || enteredContent.trim() === "") {
    console.error("Please enter both title and content.");
    return;
  }

  await createPost(enteredTitle, enteredContent);
});

postList.addEventListener("click", async (event) => {
  if (event.target.tagName === "BUTTON") {
    const listItem = event.target.closest("li");
    const postId = listItem.id;
    try {
      await axios.delete(
        `https://jsonplaceholder.typicode.com/posts/${postId}`
      );

      deletedPostElement.push(listItem);
      listItem.remove();
    } catch (error) {
      console.error("Error deleting post :", error.message);
    }
  }
});

restoreButton.addEventListener("click", async () => {
  if (deletedPostElement.length === 0) {
    return;
  }

  for (const deletedElement of deletedPostElement) {
    try {
      const response = await axios.post(
        "https://jsonplaceholder.typicode.com/posts",
        {
          title: deletedElement.querySelector("h2").textContent.toLowerCase(),
          body: deletedElement.querySelector("p").textContent,
        }
      );

      if (response) {
        listElement.append(deletedElement);
      } else {
        console.error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error restoring post:", error.message);
    }
  }
  sortElementById();
  deletedPostElement.length = 0;
});
