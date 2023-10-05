
// TODO: use testing libraries to perform formal tests

const express = require('express'), app = express();

const fs = require('fs');

const expressReply = require('./index');

app.use(expressReply);

app.get('/ok1', (req, res, next) =>{
	res._reply({
		code: 201,
		body: { someKey: "Some Data" },
		props: { accessToken: 'loo......ong Token' }
	}, 
	{
		log: 'all'
	})
});

app.get('/ok2', (req, res, next) =>{
	res._reply({
		code: 200,
		body: "Some Data",
		props: { accessToken: 'loo......ong Token' }
	}, 
	{
		log: 'all'
	})
});

app.get('/ok3', (req, res, next) =>{
	res._reply({
		code: 200,
		body: Buffer.from("Some Data"),
		props: { accessToken: 'loo......ong Token' }
	}, 
	{
		log: 'all'
	})
});

app.get('/ok4', (req, res, next) =>{
	res._reply({
		code: 200,
		body: NaN, // null, undefined
		props: { accessToken: 'loo......ong Token' }
	}, 
	{
		log: 'all'
	})
});

app.get('/ok5', (req, res, next) =>{
	res._reply({
		code: 200,
		headers: {
			'content-disposition': "attachment; filename=example-image.jpeg"
		},
		body: fs.createReadStream('./resources/example.jpeg'), // null, undefined
	}, 
	{
		log: 'all'
	})
});

app.get('/ko1', (req, res, next) =>{
	res._reply({
		code: 200,
		body: new Error("Some Data"),
		props: { accessToken: 'loo......ong Token' }
	}, 
	{
		log: 'all'
	})
});

app.get('/ko2', (req, res, next) =>{
	res._reply(new Error("Some Data"), { log: 'all' })
});


app.listen(process.env.PORT || 3000, () => console.log("Started"));
