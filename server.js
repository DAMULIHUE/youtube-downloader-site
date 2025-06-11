const ytDl = require('youtube-dl-exec');
const express = require('express');
const fs = require('fs');
const app = express();

//dowload video (test purpose)

async function download(url){
	fs.unlink('./video.mp4', (err) => console.log(err || "video.mp4 foi deletado"));
	const video = await ytDl(url , {
		format: "mp4",
		paths: "~/teste",
		o: "video.mp4"
	}).then(output => { 
		// retorna o getFilename (ver doc da lib)
		return output;
	});
	
	// retorna o path do video
	return video;
}

app.use("/", express.static("./", {index: 'index.html' }));

// pra atender as reqs em json
app.use(express.json());

app.post("/video", async (req, res, next) => {
	
	const { url } = req.body;
	const video = await download(url);
	console.log(video);
	res.sendFile(`video.mp4`, { root: "./" });
})
// mudei coisa aqui posso fuder tudo
app.get("/video", async (req, res, next) => {
	
	res.send('mordecai & rigby');
})


app.listen(6969, (err) => {
	console.log(err || "aberto na porta 6969");
})
