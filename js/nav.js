"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

//binds the nav submit story button to the function to submit a story form
$navSubmitStory.on("click", submitStoryFormClick); 
//same as above for favorites
$navFavorites.on("click", favoriteStoryFormClick);
//as above for my stories
$navMyStories.on("click", myStoriesClick);
//hides page components and populates the my stories list (same as below)
function myStoriesClick(evt){
  console.debug("myStoriesClick", evt)
  hidePageComponents();
  putMyStoriesOnPage();
}

function submitStoryFormClick(evt) {
  console.debug("submitStoryFormClick", evt);
  hidePageComponents()
  $submitStoryForm.show();
}

function favoriteStoryFormClick(evt){
  console.debug("favoriteStoryForm", evt)
  hidePageComponents();
  putFavoriteStoriesOnPage();
}