const listElement = document.querySelector(".posts");
const postTemplate = document.getElementById("single-post");
const form = document.querySelector("#new-post form");
const fecthButton = document.getElementById("fecth-button");
const restoreButton = document.getElementById("restore-button");
const postList = document.querySelector("ul");

let postsLoaded = false;
const deletedPostElement = [];

const sendHttpRequest = (method, url, data = null) => {
  const promise = new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.responseType = "json"; //metodo 2

    xhr.onload = () => {
      // const listOfPost = JSON.parse(xhr.response); //metodo 1
      resolve(xhr.response);
    };
    xhr.send(JSON.stringify(data));
  });

  return promise;
};

const fetchPosts = async () => {
  if (postsLoaded) {
    return;
  }

  const responseData = await sendHttpRequest(
    "GET",
    "https://jsonplaceholder.typicode.com/posts"
  );

  const listOfPost = responseData;

  for (const post of listOfPost) {
    // if (!deletedPostElement.has(post)) {
    const postEl = document.importNode(postTemplate.content, true);
    postEl.querySelector("h2").textContent = post.title.toUpperCase();
    postEl.querySelector("p").textContent = post.body;
    postEl.querySelector("li").id = post.id;
    listElement.append(postEl);
    // }
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
    const createdPostResponse = await sendHttpRequest(
      "POST",
      "https://jsonplaceholder.typicode.com/posts",
      post
    );

    // Verificar si la respuesta del servidor es válida
    if (createdPostResponse && createdPostResponse.id) {
      // Utilizar directamente el ID del nuevo post para mostrar en la lista
      const postEl = document.importNode(postTemplate.content, true);
      postEl.querySelector("h2").textContent = post.title.toUpperCase();
      postEl.querySelector("p").textContent = post.body;
      postEl.querySelector("li").id = post.userId;

      listElement.prepend(postEl);

      form.reset();
    } else {
      console.error("invalid response from server");
    }
  } catch (error) {
    console.error("Error creating post:", error.message);
  }
};

fecthButton.addEventListener("click", fetchPosts);

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
      await sendHttpRequest(
        "DELETE",
        `https://jsonplaceholder.typicode.com/posts/${postId}`
      );

      // listItem.remove();
      deletedPostElement.push(listItem);
      listItem.remove();
    } catch (error) {
      console.error("Error deleting post :", error.message);
    }
  }
});


restoreButton.addEventListener("click", async () => {
  deletedPostElement.sort((a, b) => a.id - b.id);

  for (const deletedElement of deletedPostElement) {
    try {
      const createdPostResponse = await sendHttpRequest(
        "POST",
        "https://jsonplaceholder.typicode.com/posts",
        {
          title: deletedElement.querySelector("h2").textContent.toLowerCase(),
          body: deletedElement.querySelector("p").textContent,
        }
      );

      if (createdPostResponse && createdPostResponse.id) {
        listElement.append(deletedElement);
      } else {
        console.error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error restoring post:", error.message);
    }
  }

  // Ordenar todos los elementos en función de sus ID después de agregar los restaurados
  Array.from(listElement.children)
    .sort((a, b) => a.id - b.id)
    .forEach((element) => listElement.appendChild(element));

  deletedPostElement.length = 0;
});