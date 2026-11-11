/*
  FEATHER RANCH KENNELS — SITE CONTENT
  ------------------------------------
  This is the one file to edit when something changes.
  Change the words between the quotes, save, and the website updates everywhere.

  - Add a new litter: copy one { ... } block inside "litters" and change the details.
  - Mark a litter as sold out: change status to "Sold out".
  - Add a started dog, stud dog or dog for adoption: add a { ... } block to that list.
  - Leave a list empty [ ] and the site shows "Call for current availability".
*/

window.FRK = {
  phone: "(209) 826-1568",
  email: "mail@featherranch.com",

  // The thin banner across the top of every page. Make it "" to hide it.
  announcement: "New litter: Black Labs born April 27, 2026 out of Ammo × Tally",

  litters: [
    {
      name: "Black Litter",
      born: "April 27, 2026",
      colors: ["Black"],
      status: "Call for availability",
      note: "This is a repeat breeding that has proven to be extremely successful!",
      sire: {
        name: "Ammo Juarez FRK SH",
        callName: "Ammo",
        photo: "images/ammo.jpg",
        about: "A great looking fox-red male Labrador Retriever. Ammo is an experienced hunter of ducks and geese and earned his AKC Senior Hunter title in the fall of 2025. He is an excellent retriever and a proven stud dog who throws confident, good retrieving, beautiful pups.",
        health: ["OFA – Good", "Eyes – Clear"]
      },
      dam: {
        name: "Talahulla FRK",
        callName: "Tally",
        photo: "images/tally.jpg",
        about: "A 60 lb. black female with an athletic build and a sweet personality. Tally hunts hard, loves to retrieve and enjoys working. Outside of hunting she is a great companion who can chill out and enjoy time with the family.",
        health: ["OFA – Pre Excellent", "Eyes – Clear"]
      }
    }
  ],

  studDogs: [
    {
      name: "Ammo Juarez FRK SH",
      photo: "images/ammo.jpg",
      details: "Fox-red male · AKC Senior Hunter · OFA Good · Eyes Clear",
      about: "Experienced duck and goose dog and a proven stud who throws confident, beautiful retrievers."
    }
  ],

  startedDogs: [],

  adoptDogs: []
};
