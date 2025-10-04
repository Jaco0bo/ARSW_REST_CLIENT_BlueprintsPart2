//@author hcadavid

apimock=(function(){

	var mockdata = [];

	mockdata["johnconnor"] = [
		{author: "johnconnor", "points": [{"x": 150, "y": 120}, {"x": 215, "y": 115}], "name": "house"},
		{author: "johnconnor", "points": [{"x": 340, "y": 240}, {"x": 15, "y": 215}, {"x": 80, "y": 300}], "name": "gear"},
		{author: "johnconnor", "points": [{"x": 50, "y": 50}, {"x": 100, "y": 100}, {"x": 150, "y": 150}, {"x": 200, "y": 200}], "name": "bridge"}
	];

	mockdata["maryweyland"] = [
		{author: "maryweyland", "points": [{"x": 140, "y": 140}, {"x": 115, "y": 115}, {"x": 180, "y": 160}], "name": "house2"},
		{author: "maryweyland", "points": [{"x": 200, "y": 200}, {"x": 250, "y": 250}, {"x": 300, "y": 300}], "name": "gear2"},
		{author: "maryweyland", "points": [{"x": 400, "y": 100}, {"x": 420, "y": 150}, {"x": 460, "y": 200}], "name": "tower"}
	];

	mockdata["sarahoconnor"] = [
		{author: "sarahoconnor", "points": [{"x": 120, "y": 220}, {"x": 180, "y": 260}, {"x": 200, "y": 280}], "name": "lab"},
		{author: "sarahoconnor", "points": [{"x": 300, "y": 180}, {"x": 320, "y": 200}, {"x": 350, "y": 240}], "name": "factory"}
	];

	mockdata["kyleReese"] = [
		{author: "kyleReese", "points": [{"x": 50, "y": 400}, {"x": 100, "y": 420}, {"x": 150, "y": 440}, {"x": 200, "y": 460}], "name": "bunker"},
		{author: "kyleReese", "points": [{"x": 250, "y": 50}, {"x": 270, "y": 70}, {"x": 290, "y": 90}, {"x": 310, "y": 110}], "name": "outpost"}
	];

	mockdata["skynet"] = [
		{author: "skynet", "points": [{"x": 100, "y": 100}, {"x": 200, "y": 200}, {"x": 300, "y": 300}, {"x": 400, "y": 400}], "name": "matrix"},
		{author: "skynet", "points": [{"x": 50, "y": 300}, {"x": 120, "y": 320}, {"x": 180, "y": 350}], "name": "grid"}
	];


	return {
		getBlueprintsByAuthor:function(authname,callback){
			callback(
				mockdata[authname]
			);
		},

		getBlueprintsByNameAndAuthor:function(authname,bpname,callback){

			callback(
				mockdata[authname].find(function(e){return e.name===bpname})
			);
		}
	}

})();

/*
Example of use:
var fun=function(list){
	console.info(list);
}

apimock.getBlueprintsByAuthor("johnconnor",fun);
apimock.getBlueprintsByNameAndAuthor("johnconnor","house",fun);*/