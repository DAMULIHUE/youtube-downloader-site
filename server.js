const ytDl = require('youtube-dl-exec');
const express = require('express');
const fs = require('fs');
const app = express();

//dowload video (test purpose)

async function downloadServidor(url, format, quality){
	
	fs.unlink(`./public/download.${format}`, (err) => console.log(err ||`download.${format} foi deletado`));

	const download = await ytDl(url , {
		t: format,
		formatSort: `res:${quality}`,
		audioQuality: quality,
		paths: "./public",
		writeThumbnail: true,
		o: `download.${format}`
	}).then(output => { 
		// retorna o 'o' (o é 'output') (ver doc da lib)		
		return output;
	});
	
	// retorna o path do video ('o')
	return download;
}

app.use("/", express.static("./public", {index: 'index.html' }));

// pra atender as reqs em json
app.use(express.json());

app.post("/video", async (req, res, next) => {
	
	const { format, quality, url } = req.body;
	const download = await downloadServidor(url, format, quality);

	// gambiarra pra corrigir o erro do arquivo.mp3.webp quando se baixa
	// um arquivo .mp3 (n sei de jeito melhor pra corrigir)
	await fs.rename("./public/download.mp3.webp", "./public/download.webp", _ => console.log("mudou nome do aquivo"));

	res.sendFile(`download.${format}`, { root: "./public" });
})

app.listen(6969, (err) => {
	console.log(err || "aberto na porta 6969");
})
