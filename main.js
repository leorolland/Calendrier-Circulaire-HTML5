const container = document.getElementById('container')
var stage = acgraph.create('container');
const PI = 3.1415926

var size = 0;
var center = []
function resize() {
	size = Math.min(container.getBoundingClientRect().width, container.getBoundingClientRect().height) / 400;
	center = [container.getBoundingClientRect().width / 2, container.getBoundingClientRect().height / 2]
}
// window.addEventListener('resize', resize)

let months = [
	{
		name: "Janvier",
		days: 31
	},
	{
		name: "Février",
		days: 29
	},
	{
		name: "Mars",
		days: 31
	},
	{
		name: "Avril",
		days: 30
	},
	{
		name: "Mai",
		days: 31
	},
	{
		name: "Juin",
		days: 30
	},
	{
		name: "Juillet",
		days: 31
	},
	{
		name: "Août",
		days: 31
	},
	{
		name: "Septembre",
		days: 30
	},
	{
		name: "Octobre",
		days: 31
	},
	{
		name: "Novembre",
		days: 30
	},
	{
		name: "Décembre",
		days: 31
	}
]

let intervals = [
	{
		from: new Date(2020, 4, 11),
		to: new Date(202, 5, 27),
		meta: {
			radius: 140
		}
	}
]
let events = []

let firstMonday = 6 // Lundi 6 Janvier
let year = 2020

let monthAngles = [];

let today = {
	date: new Date(),
	daysElapsed: getDayNumber(new Date())
}

function processAngles(mois) {
	let daycount = months.reduce((acc, v) => acc += v.days, 0)
	months.forEach(m => {
		monthAngles.push(m.days * (360 / daycount))
	})
}

async function draw() {
	await listUpcomingEvents()
	resize()
	processAngles(months)
	drawSeasons()
	drawDays()
	drawMonths()
	intervals.forEach(i => addInterval(i.from, i.to, i.meta))
	events.forEach((e, index) => {
		let offset = index%3 * 10
		addEvent(e, offset)
	})
}

function drawSeasons() {
	let radius = 128 * size
	let angles = [
		getAngleOfDay(new Date(year, 2, 21)),
		getAngleOfDay(new Date(year, 5, 21)),
		getAngleOfDay(new Date(year, 8, 21)),
		getAngleOfDay(new Date(year, 11, 21)),
	]
	console.log(angles)
	let printemps = stage.path()
	let width = 45*size
	printemps.circularArc(center[0], center[1], radius, radius, angles[0], angles[1]-angles[0])
	printemps.stroke({color: "#00FF0044"}, width, "");77777777
	let ete = stage.path()
	ete.circularArc(center[0], center[1], radius, radius, angles[1], angles[2]-angles[1])
	ete.stroke({color: "#FF000044"}, width, "");
	let automne = stage.path()
	automne.circularArc(center[0], center[1], radius, radius, angles[2], angles[3]-angles[2])
	automne.stroke({color: "#FFFF0044"}, width, "");
	let hiver = stage.path()
	hiver.circularArc(center[0], center[1], radius, radius, angles[3], (angles[0]+360)-angles[3])
	hiver.stroke({color: "#77777744"}, width, "");
}

function drawMonths() {
	let lastAngle = -90
	for (let i = 0; i < monthAngles.length; i++) {
		acgraph.vector.primitives.donut(stage, center[0], center[1], size * 150, size * 25, lastAngle, monthAngles[i]);
		let [x, y] = getPointAtAngle(degreesToRadians(lastAngle + monthAngles[i] / 2), 180)
		// Setup text
		// Path to wrap text
		let textDistance = size * 120
		let circlePath = stage.path();
		
		circlePath.circularArc(center[0], center[1], textDistance, textDistance, lastAngle + 2, 360);
		let text = stage.text(0, 0, months[i].name)
		// set path
		text.path(circlePath);
		text.fontSize(`${10 * size}px`);
		lastAngle += monthAngles[i]
	}
}

function drawDays() {
	let dayCount = months.reduce((acc, v) => acc += v.days, 0)
	let lastAngle = -90
	for (let i = 1; i <= dayCount; i++) {
		lastAngle += 360/dayCount
		let path = stage.path()
		let [fromX, fromY] = getPointAtAngle(degreesToRadians(lastAngle), size * 150)
		let innerRadius = 148 * size
		let [toX, toY] = []
		let dayOfWeek = (i+7-firstMonday)%7
		if ((i+1) == today.daysElapsed) {
			[toX, toY] = getPointAtAngle(degreesToRadians(lastAngle), 0*size)
			path.stroke({color: "red"}, 2, "", "round", "round");
		} else if ([5,6].includes(dayOfWeek)) {
			[toX, toY] = getPointAtAngle(degreesToRadians(lastAngle), innerRadius-20)
			path.stroke({color: "darkgreen"}, 2, "", "round", "round");
		} else {
			[toX, toY] = getPointAtAngle(degreesToRadians(lastAngle), innerRadius-dayOfWeek*2)
			path.stroke({color: "grey"}, 2, "", "round", "round");
		}
		path.moveTo(fromX, fromY)
		path.lineTo(toX, toY)
	}
}

function getPointAtAngle(angle, distance) {
	let x = Math.cos(angle) * distance + center[0]
	let y = Math.sin(angle) * distance + center[1]
	return [x, y]
}

function degreesToRadians(angle) {
	return angle / 360 * (2 * PI)
}

function getDayNumber(date) {
	const ONE_DAY = 1000 * 60 * 60 * 24;
	const differenceMs = Math.abs(date - new Date(year, 0, 1));
	return Math.round(differenceMs / ONE_DAY);
}

function getAngleOfDay(date) {
	return (getDayNumber(date)/365)*360-90
}

function addInterval(from, to, meta) {
	let interval = stage.path()
	let angle1 = getAngleOfDay(from)
	let angle2 = getAngleOfDay(to)
	interval.circularArc(center[0], center[1], meta.radius, meta.radius, angle1, angle2-angle1)
	interval.stroke({color: "#3333FF22"}, 6, "");
}

function addEvent(e, offset) {
	let arrow = stage.path()
	let angle = getAngleOfDay(e.date)
	let angleDeg = degreesToRadians(angle)
	const [fromX, fromY] = getPointAtAngle(angleDeg, 150*size)
	const [toX, toY] = getPointAtAngle(angleDeg, (165+offset)*size)
	arrow.stroke({color: "black"}, 2, "", "round", "round");
	arrow.moveTo(fromX, fromY)
	arrow.lineTo(toX, toY)
	const [txtX, txtY] = getPointAtAngle(angleDeg, (170+offset)*size)
	let text = stage.text(txtX, txtY-2*size, e.meta.title)
	text.fontSize(`${7 * size}px`);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
	return gapi.client.calendar.events.list({
		'calendarId': 'primary',
		'timeMin': (new Date()).toISOString(),
		'showDeleted': false,
		'singleEvents': true,
		'maxResults': 10,
		'orderBy': 'startTime'
	}).then((response) => {
		var ets = response.result.items;
		appendPre('Upcoming events:');

		if (ets.length > 0) {
			for (i = 0; i < ets.length; i++) {
				var event = ets[i];
				console.debug(event)
				var when = event.start.dateTime;
				if (!when) {
					when = event.start.date;
				}
				appendPre(event.summary + ' (' + when + ')')
				events.push({
					date: new Date(event.start.dateTime),
					meta: {
						title: event.summary
					}
				})
			}
		} else {
			appendPre('No upcoming events found.');
		}
	});
}
