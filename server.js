const ytDl = require('youtube-dl-exec');
const express = require('express');
const fs = require('fs');
const app = express();

//dowload video (test purpose)

async function downloadServidor(url){
	
	fs.unlink('./public/video.mp4', (err) => console.log(err || "video.mp4 foi deletado")) 
	const video = await ytDl(url , {
		format: "mp4",
		paths: "./public",
		o: "video.mp4"
	}).then(output => { 
		// retorna o getFilename (ver doc da lib)
		return output;
	});
	
	// retorna o path do video
	return video;
}

app.use("/", express.static("./public", {index: 'index.html' }));

// pra atender as reqs em json
app.use(express.json());

app.post("/video", async (req, res, next) => {
	
	const { url } = req.body;
	const video = await downloadServidor(url);
	console.log(video);
	res.sendFile(`video.mp4`, { root: "./public" });
})

app.listen(6969, (err) => {
	console.log(err || "aberto na porta 6969");
})
