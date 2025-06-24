# App Planning

## Overview

This app is a movie star poster generator that uses the TMDb API to fetch movie star information and the Replicate API to generate a poster for the movie star.

## Tech Stack

- Next.js
- Tailwind CSS
- Replicate
- TMDb

## Features

- [x] Search for a movie star by name
- [x] Fetch movie star information from TMDb
- [x] Add checkboxes to select movie star's movies. Limit the number of movies to 5 to easy the prompt generation.
- [x] Add a select dropdown to choose the poster style.
- [ ] Generate a poster for the movie star using Replicate. Take into account the selected movies and the poster style.
- [ ] Display the poster and movie star information

## Poster style guide

### Timeline Flow

1. The user selects up to 5 movies for the movie star.
2. The user selects a poster style "Timeline flow".
3. The user clicks the "Generate Poster" button.
4. The app generates a poster for the movie star using Replicate. Take into account the selected movies and the poster style.
5. The app displays the poster and movie star information.

<example>
    1. The movie start is Will Smith
    2. The user selects the following movies: I'm Robot, Hitch, The Pursuit of Happyness, Focus
    3. The user selects the poster style "Timeline flow"
    4. The user clicks the "Generate Poster" button
    5. The app generates a poster for the movie star using Replicate. In the poster I can see in what order the movies were released. For each movie, add a short description of the role or achievement. Use a modern, clean color palette.
    6. The app displays the poster and movie star information.
</example>

### Mind Map

1. The user selects up to 5 movies for the movie star.
2. The user selects a poster style "Mind Map".
3. The user clicks the "Generate Poster" button.
4. The app generates a poster for the movie star using Replicate. Take into account the selected movies and the poster style.
5. The app displays the poster and movie star information.

<example>
   1. The movie start is Will Smith
   2. The user selects the following movies: I'm Robot, Hitch, The Pursuit of Happyness, Focus
   3. The user selects the poster style "Mind Map"
   4. The user clicks the "Generate Poster" button
   5. The app generates a poster for the movie star using Replicate. In the poster I can see a mind map of the movie star's career.For each movie, add a short description of the role or achievement. Use a modern, clean color palette.
   6. The app displays the poster and movie star information.
</example>
