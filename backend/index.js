const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

const express = require('express');
const app = express();

app.get('/', async (req, res) => {
  const document = firestore.doc('posts/intro-to-firestore');

	// Enter new data into the document.
	await document.set({
		title: 'Welcome to Firestore',
		body: 'Hello World',
	});
	console.log('Entered new data into the document');

	// Update an existing document.
	await document.update({
		body: 'My first Firestore app',
	});
	console.log('Updated an existing document');

	// Read the document.
	const doc = await document.get();
	console.log('Read the document');

	// Delete the document.
	await document.delete();
	console.log('Deleted the document');

  res.send(doc.data());
});

app.listen(3000);