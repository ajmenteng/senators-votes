window.onload = init;

function init(){
	if(localStorage.getItem("senators") === null){
		loadXML('partyList.xml');	
	}
	else{
		loadLS();
	}
}

function allowDrop(e) {
    e.preventDefault();
}

function drag(e) {
    e.dataTransfer.setData("text", e.target.id);
}

function drop(e) {
    e.preventDefault();
    var voted;
    var data = e.dataTransfer.getData("text");
    if(checkTarget(e,data) === true){
    	e.target.appendChild(document.getElementById(data));

    	//Check if a name is dropped back on the members area or not
    	//If it is dropped back then set the voted value to false
    	//Otherwise set the voted value to true
    	if(e.target.id == 'members'){
    		voted = false;    		
    	}
    	else{
    		voted = true;
    	}
    	updateVote(e,document.getElementById(data).innerHTML,voted);
    }  
}

//Check the target of dropping area.
//A name can be dropped on the associated party area OR back to the members area 
function checkTarget(e,data){
	var senators = JSON.parse(localStorage.senators);
	for (var i=0; i<senators.length; i++){
		if((senators[i].name === data && senators[i].party === e.target.id) || e.target.id == 'members'){
			return true;
		}
	}
	return false;
}

//This function is called by drop() when a drop event occured
function updateVote(e,sname,voted){
	var senators = JSON.parse(localStorage.senators);
	for (var i=0; i<senators.length; i++){
		if(senators[i].name === sname){
			senators[i].voted=voted;
		}
	}
	localStorage.setItem("senators",JSON.stringify(senators));
}

//Load data from XML file
function loadXML(url){
	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {	
			add2LocalStorage(xhttp);
		}
	}
	xhttp.open("GET", url, true);
	xhttp.send();
}

//Load data from LocalStorage
function loadLS(){
	var senators = JSON.parse(localStorage.senators);
	for (var i=0; i<senators.length; i++){
		if(senators[i].voted === false){
			displayList(senators[i].name,'members');
		}
		else{
			displayList(senators[i].name,senators[i].party);
		}
	}
	document.getElementById("msg").innerHTML = "From LocalStorage Loaded " + senators.length + " senators";
}

//Display the names on the appropriate area (e.g. members, Democrat, or Republican)
function displayList(sname,group){
	var element = document.createElement("li");
	element.setAttribute("id",sname);
	element.setAttribute("draggable",true);
	element.setAttribute("ondragstart","drag(event)");
	element.innerHTML = sname;
	document.getElementById(group).appendChild(element);
}


//This function is called in loadXML() to add data into LocalStorage
function add2LocalStorage(xml){
	var xmlDoc = xml.responseXML;
	var key = "senators";
	var x = xmlDoc.getElementsByTagName("senator");
	var senators = [];
	for(var i = 0; i < x.length; i++){
		sname = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
		displayList(sname, 'members');
		senators.push({
			"name": sname,
			"party": x[i].getElementsByTagName("party")[0].childNodes[0].nodeValue,
			"voted": false
		});
	}
	localStorage.setItem(key, JSON.stringify(senators));	
	document.getElementById("msg").innerHTML = "From AJAX Loaded " + x.length + " senators";
}