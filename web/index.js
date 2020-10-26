const express = require('express');
const session = require('express-session');
const axios = require("axios");

var app = express()

const client_id = "703292047934881904";
const key = "2dh1eFiNTYIaiTSzs7-Sb__bAfiJZOc2";
const bot_token = "NzAzMjkyMDQ3OTM0ODgxOTA0.XqMdwg.5hIlYVZoLKTIfjgCdjreI7nbijc";
const redirect_uri = "http%3A%2F%2F192.168.88.18%3A3000%2Foauth%2Fredirect";
const scopes = "identify%20connections%20guilds"

const makeOauth = async (code, session) => {
	let querystring = `client_id=${client_id}&client_secret=${key}&grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}&scope=${scopes}`;
	let resp = await axios(`https://discord.com/api/v6/oauth2/token`, {
		method: 'POST',
		data: querystring,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	})
	Object.assign(session, resp.data);
}

const getInfo = async (session) => {
	let resp = await axios(`https://discord.com/api/v6/users/@me`, {
		headers: {
			authorization: `Bearer ${session.access_token}`
		}
	});
	return resp.data;
}

const sendWelcomeDM = async (session) => {
	let user = await getInfo(session);
	let dmChannel = await axios(`https://discord.com/api/v6/users/@me/channels`, {
		method: 'POST',
		data: {
			recipient_id: user.id,
		},
		headers: {
			"content-type": "application/json",
			authorization: `Bot ${bot_token}`
		}
	})
	await axios(`https://discord.com/api/v6/channels/${dmChannel.data.id}/messages`, {
		method: 'POST',
		data: {
			content: "OAuth2 successful",
		},
		headers: {
			"content-type": "application/json",
			authorization: `Bot ${bot_token}`
		}
	});
}

function uuidv4() {
	return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	  return v.toString(16);
	});
}

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}))

app.get('/', async (req, res) => {
	if (req.session.access_token) return res.send(await getInfo(req.session));
	req.session.state = uuidv4();
	res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scopes}&state=${req.session.state}`);
})

app.get("/oauth/redirect", async (req, res) => {
	if (req.query.state != req.session.state) return res.send("Invalid State");
	await makeOauth(req.query.code, req.session);
	sendWelcomeDM(req.session);
	res.send("Authorized")
})

app.listen(3000, () => {
	console.log(`Listening on ::3000`)
});
