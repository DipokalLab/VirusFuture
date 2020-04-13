var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var fs = require('fs');
var cookieParser = require('cookie-parser');
var i18n = require('i18n');
var helmet = require('helmet');

app.set('view engine','ejs');
app.set('views','./views');
app.enable('trust proxy');
app.use(express.static('pub'));
app.use(helmet());
app.use(cookieParser());
i18n.configure({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  cookie: 'lang',
  directory: __dirname + '/locales'
});
app.use(i18n.init);


function replace(val){
	return val.replace(/\n/g, "");
}

function average(array) {
    let result = 0;
    for (let i = 0; i <array.length; i++) {
		if(!isNaN(array[i])){
			result += array[i];
		}

    }
    return result / array.length;
}

function as() {
	//strArray = [30, 36, 39, 54, 61, 110, 133, 187, 231, 305];
	var time = ["2020-01-23","2020-01-24","2020-01-25","2020-01-26","2020-01-27","2020-01-28","2020-01-29","2020-01-30","2020-01-31","2020-02-01","2020-02-02","2020-02-03","2020-02-04","2020-02-05","2020-02-06","2020-02-07","2020-02-08","2020-02-09"];
	var nowCorona = [30, 36, 39, 54, 61, 110, 133, 187, 259, 305,362,426,490,565,634,722,804,908];
	var risedata = [];
	var rise = [];
	for (let j = 1; j < nowCorona.length; j++) {
		risedata.push(nowCorona[j]-nowCorona[j-1]);
	}
	for (let k = 2; k < risedata.length; k++) {
		rise.push(risedata[k]-risedata[k-1]);
	}
 	//console.log(risedata);
	//console.log(rise);
	//console.log(average(rise));
	return (Number(risedata[risedata.length-1]) + Number(average(rise))) + Number(nowCorona[nowCorona.length-1]);
	//console.log(nextData);
}

function sir(inf, ck) {
	var s = inf*8;
	var i = inf;
	var r = inf/3.179105075511757;
	var eons = 950;
	var rateSI = 0.0132;
	var rateIR = 0.01
	var n = s+i+r;

	var Susceptible = [s];
	var Infected = [i];
	var Resistant = [r];
	for (let i = 0; i < eons; i++) {
		if (i < ck-1) {
			Susceptible.unshift(NaN);
			Infected.unshift(NaN);
			Resistant.unshift(NaN);
		} else {
			var stoi = (rateSI*Susceptible[i]*Infected[i])/n;
			var itor = Infected[i] * rateIR;
			Susceptible.push(Susceptible[i] -stoi);
			Infected.push(Math.floor(Infected[i] + stoi - itor));
			Resistant.push(Resistant[i] + itor);
		}


	}
	//console.log(Infected)
	return Infected;
}

function sirKor(i, ck, r0) {
  var r = r0*4;
	var s = 23800;
	var eons = 950;
	var rateSI = 0.039;
	var rateIR = 0.01;
	var n = s+i+r;

	var Susceptible = [s];
	var Infected = [i];
	var Resistant = [r];
	for (let i = 0; i < eons; i++) {
		if (i < ck-1) {
			Susceptible.unshift(NaN);
			Infected.unshift(NaN);
			Resistant.unshift(NaN);
		} else {
			var stoi = (rateSI*Susceptible[i]*Infected[i])/n;
			var itor = Infected[i] * rateIR;
			Susceptible.push(Susceptible[i] -stoi);
			Infected.push(Math.floor(Infected[i] + stoi - itor));
			Resistant.push(Resistant[i] + itor);
		}
	}
	//console.log(Infected)
	return Infected;
}


app.get('/en',function(req,res){
    res.cookie('lang', 'en');
    res.redirect('back');
});

app.get('/ko', function(req,res){
    res.cookie('lang', 'ko');
    res.redirect('back');
});

app.get('/', function(req, res) {
	fs.readFile('pub/corona.txt', 'utf8', function(err, data){
		var strArray=data.split(',');
		var time = [];
		var nowCorona = [];
		var nowCoronaKor = [];

		var risedata = [];
		var rise = [];
		for (let i = 0; i < strArray.length; i++) {
		if(i%2){
			var n_ch = strArray[i].split(':')[0];
			var n_ko = strArray[i].split(':')[1];

			if (!isNaN(n_ko)) {
				nowCoronaKor.push(n_ko);
			}
			if (!isNaN(n_ch)) {
				nowCorona.push(n_ch);
			}
		}else{
			time.push(replace(String(strArray[i])));
		}

		}
		for (let j = 1; j < nowCorona.length; j++) {
			risedata.push(nowCorona[j]-nowCorona[j-1]);
		}
		for (let k = 2; k < risedata.length; k++) {
			rise.push(risedata[k]-risedata[k-1]);
		}

    	var lastcorona = nowCorona[nowCorona.length-1];
    	var lastcoronaKor = nowCoronaKor[nowCoronaKor.length-1];

	 	//console.log(risedata);
		//console.log(rise);
		//console.log(average(rise));
		var nextData = (Number(risedata[risedata.length-1]) + Number(average(rise))) + Number(nowCorona[nowCorona.length-1]);
		//console.log(nextData);

		// ================= 매일 수정 =====================
		var lastKordatas = 90; //기간
		var outKorr = 30; //확진환자 격리해제
		// ================= 매일 수정 =====================


    	res.render('index', {
			time: JSON.stringify(time),
			data: nowCorona,
			nextdata: Math.floor(nextData),
	     	nextdiedata: Math.floor(as()),
		  	sir: sir(Number(lastcorona), Number(nowCorona.length)),
			sirlast: sir(Number(lastcorona), Number(nowCorona.length))[nowCorona.length],
			dataKor: nowCoronaKor,
			timeKor: JSON.stringify(time.slice( 35, lastKordatas )),
			lastdataKor: nowCoronaKor[nowCoronaKor.length-1],
			sirKor: sirKor(Number(lastcoronaKor), Number(lastcoronaKor.length), outKorr).slice( 3, lastKordatas ),
			nextsirKor: sirKor(Number(lastcoronaKor), Number(lastcoronaKor.length), outKorr)[lastcoronaKor.length]

		});
	});

});

app.get('/about', function(req, res) {
		res.render('about');
});

app.get('/record', function(req, res) {
		res.render('log');
});
app.get('/research', function(req, res) {
	res.render('o');
});


server.listen(3001, function() {
  console.log('vf: 0.1.0 >> Server listen on port ' + server.address().port);
  console.log('vf: Start >> vf 프로젝트에 오신것을 환영합니다.');
});
