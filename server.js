const ytDl = require('youtube-dl-exec');
const express = require('express');
const fs = require('fs');
const app = express();

//dowload video (test purpose)

async function downloadServidor(url, format, resolution){
	
	fs.unlink('./public/video.mp4', (err) => console.log(err || "video.mp4 foi deletado")) 
	const video = await ytDl(url , {
		format: format,
		formatSort: `res:${resolution}`,
		paths: "./public",
		o: `video.${format}`
	}).then(output => { 
		// retorna o 'o' (o é 'output') (ver doc da lib)
		return output;
	});
	
	// retorna o path do video ('o')
	return video;
}

app.use("/", express.static("./public", {index: 'index.html' }));

// pra atender as reqs em json
app.use(express.json());

app.post("/video", async (req, res, next) => {
	
	const { url, format, resolution } = req.body;
	const video = await downloadServidor(url, format, resolution);
	console.log(video);
	res.sendFile(`video.${format}`, { root: "./public" });
})

app.listen(6969, (err) => {
	console.log(err || "aberto na porta 6969");
})
