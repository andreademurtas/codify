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
		"id": "1",
        "title": "Challenge 1",
        "description": "Stampa la somma dei primi 100 numeri naturali (partendo da 1).",
		"answer": "5050"
	},
    {
		"id": "2",
        "title": "Challenge 2",
		"description": "Stampa la somma dei primi 100 numeri pari (partendo da 2).",
		"answer": "2550"
	},
    {
		"id": "3",
        "title": "Challenge 3",
		"description": "The prime factors of 13195 are 5, 7, 13 and 29.\n What is the largest prime factor of the number 600851475143?\n\n(From ProjectEuler.net: https://projecteuler.net/problem=3. No changes were made. A copy of the license can be found at: https://creativecommons.org/licenses/by-nc-sa/4.0/)",
		"answer": "6857"
	},
	{
		"id": "4",
        "title": "Challenge 4",
		"description": "Tim sta imparando a scrivere al computer, riesce a scrivere le lettere \"F\" e \"X\" con la mano sinistra e \"F\" e \"O\" con la mano destra. Considerando una stringa formata da soli caratteri \"F\", \"O\" e \"X\", sia F(n) il numero minimo di cambi di mano che Tim deve fare per scrivere la stringa n=\"XFOFXOFOXFOFOXFXOXOFOOXOXOFOXFFOXOOFOXFXXFOXFOXOFOXFOFFFXOXOFOXFFFXOXFOXOFOOXFOOOFXFXX\" di lunghezza |W|. Calcolare F(n).",
		"answer": "38"
	},
	{
		"id": "5",
        "title": "Challenge 5",
		"description": "Riprendendo il problema precedente, Tim sta imparando a scrivere al computer, riesce a scrivere le lettere \"F\" e \"X\" con la mano sinistra e \"F\" e \"O\" con la mano destra. Considerando una stringa formata da soli caratteri \"F\", \"O\" e \"X\", sia F(n) il numero minimo di cambi di mano che Tim deve fare per scrivere la stringa n=\"XFOFXOFOXFOFOXFXOXOFOOXOXOFOXFFOXOOFOXFXXFOXFOXOFOXFOFFFXOXOFOXFFFXOXFOXOFOOXFOOOFXFXX\" di lunghezza |W|. Calcolare la somma di F(k) dove k sono tutte le sottostringhe di n. \nEsempio: n=\"XOF\", S = F(\"X\") + F(\"O\") + F(\"F\") + F(\"XO\") + F(\"OF\") + F(\"XOF\") = 0 + 0 + 0 + 1 + 0 + 1 = 2",
		"answer": "48874"
	}
]);
