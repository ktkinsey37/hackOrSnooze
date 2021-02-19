"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    const urlBreakdown = new URL(this.url)
    return urlBreakdown.host;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    //get stories should work regardless of who the user is, or even if there isnt a defined and logged in 'user'

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, {title, author, url}) {
    const token = user.loginToken;
    let results = await axios.post("https://hack-or-snooze-v3.herokuapp.com/stories", {
      token: token,
      story: {
          author: author,
          title: title,
          url: url
      }
  })
  results = new Story(results);
  return results;
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

   //this function checks if favorite and returns the proper markup. should run when page is created
   //if any item in the current user favorite's array is also the id of the story, return true
  static checkIfFavorite(story){
    const storyToCheck = story.storyId
    if (currentUser.favorites.some(story => story.storyId === storyToCheck)) {
      return true;
    } else {
      return false;
    }
  }

  //The function below toggles the star icon next to the story and
  //then chooses to pass the story to addFavorite or removeFavorite

  static async toggleFavorite(evt){
    let star = (evt.target.closest('i'))
    const storyToFavoriteId = evt.target.closest('li').id
    let storyToToggle = await axios.get(`${BASE_URL}/stories/${storyToFavoriteId}`)
    storyToToggle = storyToToggle.data.story
    const isStoryAFavorite = User.checkIfFavorite(storyToToggle);
    if(isStoryAFavorite){
      star.classList.remove('fas')
      star.classList.add('far')
      User.removeFromFavorites(storyToToggle.storyId)
    } else {
      star.classList.remove('far')
      star.classList.add('fas')
      User.addToFavorites(storyToToggle.storyId)
    }
  }

  //the below function just adds to favorites
  static async addToFavorites(story){
    let token = currentUser.loginToken
    await axios({
        url: `${BASE_URL}/users/${currentUser.username}/favorites/${story}`,
        method: "POST",
        params: { token },
      });
      let storyToAdd = await axios.get(`${BASE_URL}/stories/${story}`)
      storyToAdd = new Story(storyToAdd.data.story)
      currentUser.favorites.push(storyToAdd)
  }

  //the below function removes from favorites
  //it gets the index of the story that's been clicked in the users favorite arrays
  //then it splices out that from the array (on the user's end)
  //then it uses that id to remove it from the API's end
  static async removeFromFavorites(story){
    let idx;
    for (idx = 0; idx < currentUser.favorites.length; idx++){
      if(currentUser.favorites[idx].storyId === story){
        break;
      }
    }
    currentUser.favorites.splice(idx, 1)
    let token = currentUser.loginToken
    await axios({
        url: `${BASE_URL}/users/${currentUser.username}/favorites/${story}`,
        method: "DELETE",
        params: { token },
      });
  }

  // deleteMyStory is a function called when the delete icon is clicked. it removes the user's story from the DOM and API
  static async deleteMyStory(evt){
    const storyToDelete = evt.target.closest('li')
    let token = currentUser.loginToken
    await axios({
          url: `${BASE_URL}/stories/${storyToDelete.id}`,
          method: "DELETE",
          params: { token },
        });
        //follows the same process as remove from favorites to remove story from currentUser
        let idx;
        for (idx = 0; idx < currentUser.ownStories.length; idx++){
          if(currentUser.ownStories[idx].storyId === storyToDelete.id){
            break;
          }
        }
        currentUser.ownStories.splice(idx, 1)
        currentUser.favorites = currentUser.favorites.filter((story)=>{
          return story.storyId !== storyToDelete.id;
        })
    storyToDelete.remove();   //removes the actual story from the DOM
    //Below logs in again to reset the whole page
    currentUser = await User.loginViaStoredCredentials(token, currentUser.username);
  }

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    const {user, token} = response.data;
    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
}
