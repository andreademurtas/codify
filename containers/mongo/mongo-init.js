db.createUser(
		{
			user: "root",
			pwd: "example",
			roles: [
				{ role: "readWrite", db: "codify" },
			]
		}
);

db.challenges.drop();
db.createCollection("challenges");
db.challenges.insertMany([
    {
        "title": "Challenge 1",
        "description": "Stampa la somma dei primi 100 numeri naturali (partendo da 1).",
		"answer": "5050"
	},
    {
        "title": "Challenge 2",
		"description": "Stampa la somma dei primi 100 numeri pari (partendo da 2).",
		"answer": "2550"
	},
    {
        "title": "Challenge 3",
		"description": "The prime factors of 13195 are 5, 7, 13 and 29.\n What is the largest prime factor of the number 600851475143?\n\n(From ProjectEuler.net: https://projecteuler.net/problem=3. No changes were made. A copy of the license can be found at: https://creativecommons.org/licenses/by-nc-sa/4.0/)",
		"answer": "6857"
	}
]);
