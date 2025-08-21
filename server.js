const ytDl = require('youtube-dl-exec');
const express = require('express');
const fs = require('fs');
const app = express();
const logger = require('progress-estimator')();

// temp solution 
function isPlaylist(url){
	const match = url.match(/list=*/);
	return match ? true : false;
}

async function downloadServidor(url, format, quality, index, PATH){

	const options = {
		t: format,
	}
	
	if(format == "mp4"){ options.formatSort = `res: ${quality}`; }
	else if(format == "mp3"){ options.audioQuality = quality; }
	
	if(index > 0 || isPlaylist(url) == false){ 
		
		options.playlistItems = index;
		options.writeThumbnail = true;
		options.o = `download.${format}`;
		options.paths = PATH;
	} else if (isPlaylist(url) == true){
		options.yesPlaylist = true;
		options.o = `${PATH}/%(playlist_title)s/%(playlist_index)s_%(title)s.%(ext)s`;
	}

	const download = ytDl(url, options)
	.then(output => { 
		// retorna o 'o' (o é 'output') (ver doc da lib)	
		return output;
	});

	const progressBar = await logger(download, `downloading...`);
	console.log(progressBar);
	// retorna o path do video ('o')
	return download;
}

app.use("/", express.static("./public", {index: 'index.html' }));

// pra atender as reqs em json
app.use(express.json());

app.post("/video", async (req, res, next) => {
	const { format, quality, url, index, PATH } = req.body;
	const download = await downloadServidor(url, format, quality, index, PATH);

	// Corrige nome de thumbnail no mp3
	await fs.rename(`${PATH}/download.mp3.webp`, `${PATH}/download.webp`, _ => console.log("mudou nome do arquivo"));

	if(PATH=="./public"){
		res.sendFile(`download.${format}`, { root: PATH });
	}else{
		res.send("<p>file downloaded on the server</p>");
	}
});
app.listen(6969, (err) => {
	console.log(err || "aberto na porta 6969");
})
