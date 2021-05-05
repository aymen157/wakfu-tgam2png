var fs = require("fs")
log = console.log

var files = fs.readdirSync("./in/")

/*
REMOVED CAUZ OUT OF MEMORY
for(let i=0; i<files.length; i++){
	var file = files[i]
	write_export(file)

}*/

function start(i){
	write_export(files[i], ()=>{
		start(i+1)
	})
}
start(0)


function write_export(file, callback){
	log(file)

	var fn = "./out/"+file.split("/").pop().replace(".tgam","")+".png"
	if(fs.existsSync(fn)){
		return
	}


	var bitstream = BitStream("./in/"+file)
	var resizeMask = bitstream.readByte() == 109;
	bitstream.skip(3);
	var imgWidth = bitstream.readShort();
	var imgHeight = bitstream.readShort();
	var tgaSize = bitstream.readInt();
	var maskSize = bitstream.readInt();
	var maskResize = (resizeMask ? bitstream.readByte() : 1) - 1;
	var tgaData = bitstream.readBytes(tgaSize);
	var maskData = bitstream.readBytes(maskSize);


	/*var TGA = require('tga');
	var buf = TGA.createTgaBuffer(imgWidth, imgHeight, tgaData);
	fs.writeFileSync(fn, buf);*/

	var PNG = require('pngjs').PNG;
	var png = new PNG({
		width: pow(imgWidth),
		height: pow(imgHeight)
	});
	png.data = tgaData;

	var ws = fs.createWriteStream(fn)
	png.pack().pipe(ws);
	ws.on('finish', ()=>{
		callback()
	})
}

function pow(x){
	var power = 1;
	while(power < x)
		power*=2;
	return power
}

function BitStream(file){
	var bitstream = { offset:0 }
	bitstream.readByte = function(){
		var r = bitstream.buffer.readInt8( bitstream.offset )
		bitstream.offset += 1
		return r
	}
	bitstream.readShort = function(){
		var r = bitstream.buffer.readInt16LE( bitstream.offset )
		bitstream.offset += 2
		return r
	}
	bitstream.readInt = function(){
		var r = bitstream.buffer.readInt32LE( bitstream.offset )
		bitstream.offset += 4
		return r
	}
	bitstream.readBytes = function(byteLength){
		var r = bitstream.buffer.slice(bitstream.offset, byteLength)
		bitstream.offset += byteLength
		return r
	}
	bitstream.skip = function(n){
		bitstream.offset += n
	}
	bitstream.buffer = fs.readFileSync(file);
	return bitstream
}