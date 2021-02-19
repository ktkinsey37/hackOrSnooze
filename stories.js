"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup");
  let starStatus;
  if(currentUser){  
  const isStoryFavorite = User.checkIfFavorite(story)
    if (isStoryFavorite){
    starStatus = 'fas';
  } else if (!isStoryFavorite){
    starStatus = 'far';
  }
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <i class="${starStatus} fa-star star-button"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
  } else {
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}}

function generateMyStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  let starStatus = 'far';
  const isStoryFavorite = User.checkIfFavorite(story)
    if (isStoryFavorite){
    starStatus = 'fas';
  } else if (!isStoryFavorite){
    starStatus = 'far';
  } 
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <i class="fa fa-trash delete-button"></i>
      <i class="${starStatus} fa-star star-button"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  if(currentUser){
     $('.star-button').click(User.toggleFavorite)        //adds a click event to all icons when they are put on the page, calls user.addfavorite
  }
  $allStoriesList.show();
}

function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage");

  $favoriteStoriesList.empty();

  const favoriteStories = new StoryList(currentUser.favorites)
  // loop through all of our stories and generate HTML for them
  for (let story of favoriteStories.stories) {
    const $story = generateStoryMarkup(story);
    $favoriteStoriesList.append($story);
  }
  $('.star-button').click(User.toggleFavorite)        //adds a click event to all icons when they are put on the page, calls user.addfavorite
  $favoriteStoriesList.show();
}

function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

  $myStoriesList.empty();

  const myStories = new StoryList(currentUser.ownStories)
  // loop through all of our stories and generate HTML for them
  for (let story of myStories.stories) {
    const $story = generateMyStoryMarkup(story);
    $myStoriesList.append($story);
  }
  $('.star-button').click(User.toggleFavorite)        //adds a click event to all icons when they are put on the page, calls user.addfavorite
  $('.delete-button').click(User.deleteMyStory)
  $myStoriesList.show();
}

$submitStorySubmitButton.on("click", submitNewStory)

async function submitNewStory(evt){
  console.debug("submitNewStory", evt)
  evt.preventDefault();
  let newStoryAuthor = $('#author-submit-story').val();
  let newStoryTitle = $('#title-submit-story').val();
  let newStoryURL = $('#url-submit-story').val();
  await storyList.addStory(currentUser, { title: `${newStoryTitle}`, author: `${newStoryAuthor}`, url: `${newStoryURL}` })
  $submitStoryForm.hide();
  $('#author-submit-story').val('');
  $('#title-submit-story').val('');
  $('#url-submit-story').val('');
  start();
}