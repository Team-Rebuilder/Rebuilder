# Rebulider

- FA24 CS336 Final Project
- Daniel Kim, Jason Chew
- Try it out [here!](https://rebuilder-app.web.app/)
  - Note that CRUD operations will be disabled after 2025-01-15

## What is Rebuilder?

Rebuilder is an online platform for sharing instructions of such alternate builds, featuring novel 3D previews, embedded instruction viewers, and part usage calculations all in one site.

- In the LEGO community, models built only from the parts of an existing LEGO set are referred to as “alternate builds.” Alternate builds are often much more economical to obtain than typical custom models, as builders are able to obtain all the parts they need from commonly available retail sets. Furthermore, alternate builds add additional "rebuild value" to sets—which is especially useful for “army builders” who buy multiple copies of a set just for the minifigures.

---

## To Run Locally

- `git clone` the repository
- You will need `credentials.ts` to run the app locally. Ask the developers for the file.
- `cd rebuilder`
- `npm install`
- `ng serve -o`

## To Deploy

- `cd rebuilder`
- `ng build`
- `firebase deploy`
