const ytDl = require('youtube-dl-exec');
const express = require('express');
const fs = require('fs');
const app = express();
const JSZip = require('jszip');
const path = require('path');

// temp solution 
function isPlaylist(url){
	const match = url.match(/list=*/);
	return match ? true : false;
}

async function zipPlaylistFolder(folderPath, zipOutputPath) {
	const zip = new JSZip();
	const files = fs.readdirSync(folderPath);

	for (const file of files) {
		const filePath = path.join(folderPath, file);
		const data = fs.readFileSync(filePath);
		zip.file(file, data);
	}

	const content = await zip.generateAsync({ type: 'nodebuffer' });
	fs.writeFileSync(zipOutputPath, content);
}


//dowload video (test purpose)

async function downloadServidor(url, format, quality, index){
	
	fs.unlink(`./public/download.${format}`, (err) => console.log(err ||`download.${format} foi deletado`));

	const options = {
		t: format,
		paths: "./public",
	}


	
	if(format == "mp4"){ options.formatSort = `res: ${quality}`; }
	else if(format == "mp3"){ options.audioQuality = quality; }
	
	if(index > 0 || isPlaylist(url) == false){ 
		
		options.playlistItems = index;
		options.writeThumbnail = true;
		options.o = `download.${format}`;
		options.paths = "./public";
	} else if (isPlaylist(url) == true){
		options.yesPlaylist = true;
		options.paths = "./public/playlist";
	}

	const download = await ytDl(url, options)
	.then(output => { 
		// retorna o 'o' (o é 'output') (ver doc da lib)	
		return output;
	});
	
	// retorna o path do video ('o')
	return download;
}

app.use("/", express.static("./public", {index: 'index.html' }));

// pra atender as reqs em json
app.use(express.json());

/*
app.post("/video", async (req, res, next) => {
	
	const { format, quality, url, index } = req.body;
	const download = await downloadServidor(url, format, quality, index);
	console.log(download);

	// gambiarra pra corrigir o erro do arquivo.mp3.webp quando se baixa
	// um arquivo .mp3 (n sei de jeito melhor pra corrigir)
	await fs.rename("./public/download.mp3.webp", "./public/download.webp", _ => console.log("mudou nome do aquivo"));

	if(index > 0 || isPlaylist(url) == false){
		res.sendFile(`download.${format}`, { root: "./public" });
	} else {

		res.sendFile(`playlist`, {root: "./public" });
	}
})
*/

app.post("/video", async (req, res, next) => {
	const { format, quality, url, index } = req.body;
	const download = await downloadServidor(url, format, quality, index);
	console.log(download);

	// Corrige nome de thumbnail no mp3
	await fs.rename("./public/download.mp3.webp", "./public/download.webp", _ => console.log("mudou nome do arquivo"));

	if(index > 0 || isPlaylist(url) == false){
		res.sendFile(`download.${format}`, { root: "./public" });
	} else {
		const playlistDir = path.join(__dirname, 'public', 'playlist');
		const zipPath = path.join(__dirname, 'public', 'playlist.zip');

		await zipPlaylistFolder(playlistDir, zipPath);

		res.sendFile('playlist.zip', { root: './public' });
	}
});


app.listen(6969, (err) => {
	console.log(err || "aberto na porta 6969");
})
