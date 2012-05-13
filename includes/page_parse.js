triplesHtml = "";

var triple_store = new Array();
var license_found = false;
var main_window = "";

namespace_data = "";

var timeout;

var attribute_info = {
	  	
						title : "",
						url : "",
						author : "",
						license : "",
						license_link : "",
						type : "",
						attribution_url : "",
						license_shorthand : ""	
						
					};
		
function add_triple(data_triple){

	var triple_added = false;

	if (triple_store.length == 0) {
	
		triple_store.push(data_triple);
		
		if(data_triple[1]=="license"){
			
			license_found = true;	
			
		}
		
		triple_added = true;						
		
	} else {
	
		for (var x = 0; x < triple_store.length; x++) {
			
			if (triple_store[x][1] != data_triple[1]) {
		
				triple_store.push(data_triple);
				triple_added = true;	
				
				if(data_triple[1]=="license"){
			
					license_found = true;	
			
				}
				
				break;
			
			}
			
		}				
		
	}
	
	if(triple_added){
		
		attribute_info.url = data_triple[0];
		
		switch(data_triple[1]){
			
			case "title": attribute_info.title = data_triple[2]; break;
			case "license": attribute_info.license_link = data_triple[2]; break;
			case "attributionName": attribute_info.author = data_triple[2]; break;
			case "attributionURL": attribute_info.attribution_url = data_triple[2]; break;
			default: break;			
			
		}
		
	}
	
}

var document_text = "";
var counter=0;

function process_page(){

	var n = document;
	var rootNode = n;
	
	while (n) {
	
		if (n.nodeName != "LINK") {
		
			if (n.hasAttributes()) {
			
				temp_attr = {};
				
				if (n.attributes.length != 1) {
				
					var attr_names = ['license cc:license', 'about', 'src', 'resource', 'href', 'instanceof', 'typeof', 'rel', 'rev', 'property', 'content', 'datatype'];
					rdfa_found = 0;
					
					for (var i = 0; i < attr_names.length; i++) {
					
						if (n.getAttribute(attr_names[i]) != null) {
						
							temp_attr[attr_names[i]] = n.getAttribute(attr_names[i]);
							
							if (n.getAttribute(attr_names[i]) != "nofollow") {
							
								asset = "";
								attribute = "";
								value = "";
								
								if (n.getAttribute(attr_names[i]).indexOf(":") == 2) {
								
									attribute = n.getAttribute(attr_names[i]).substring(3);
									
								}
								
								if (attr_names[i] == "property") {
								
									value = n.innerHTML;
									
								}
								
								if (attr_names[i] == "rel" && n.getAttribute(attr_names[i]).indexOf("license") != -1) {
								
									value = n.getAttribute("href");
									attribute = "license";
									
								}
								
								if (attr_names[i] == "href" && n.getAttribute(attr_names[i]).indexOf("http://") != -1) {
								
									value = n.getAttribute("href");
									
								}
								
								if (asset == "") {
								
									asset = document.location.href;
									
									if (attribute == "") {
									
										if (n.getAttribute("property") == "cc:attributionName" && n.getAttribute("rel") == "cc:attributionURL") {
										
											attribute = n.getAttribute(attr_names[i]);
											triple_array = Array(asset, "cc:attributionName", n.innerHTML);
											add_triple(triple_array);
											attribute = "attributionURL";
											
											
										}
										else {
										
											attribute = n.getAttribute(attr_names[i]);
											
										}
										
									}
									
								}
								
								if (attribute == "type") {
								
									value = n.getAttribute("href")
									
								}
								
								if (attribute == "attributionURL") {
								
									value = n.getAttribute("href")
									
								}
								
								if (attribute == "attributionName") {
								
									value = n.innerHTML;
									
								}
								
								if (value != attribute) {
								
									if (asset != null && attribute != null && value != null) {
									
										if (asset.length != 0 && attribute.length != 0 && value.length != 0) {
										
											base = document.location.href.split("/")[2];
											if (value.indexOf("http://") == 0) {
											
												if (base != value.split("/")[2]) {
												
													triple_array = Array(asset, attribute, value);
													add_triple(triple_array);
													triple_array = Array();
													
												}
												
											}
											else {
											
												triple_array = Array(asset, attribute, value);
												add_triple(triple_array);
												triple_array = Array();
												
											}
											
										}
										
									}
									
								}
								
							}
							
						}
						
					}
					
				}
				
			}
			
		}
		
		if (n.v) {
			n.v = false;
			if (n == rootNode) {
				break;
			}
			if (n.nextSibling) {
				n = n.nextSibling;
			}
			else {
				n = n.parentNode;
			}
		}
		else {
			if (n.firstChild) {
				n.v = true;
				n = n.firstChild;
			}
			else 
				if (n.nextSibling) {
					n = n.nextSibling;
				}
				else {
					n = n.parentNode;
				}
		}
		
		
	}
	
	switch (window.location.toString().split(".")[1]) {
	
		case "flickr":
						var loggedin = document.body.innerHTML.split('data-ywa-name="Account name">');
						if (loggedin.length != 1) {
						
								logged_in_user = loggedin[1]
								logged_in_user = logged_in_user.split('</a>')[0];
								var photo_by = document.body.innerHTML.split('<strong class="username">By <a href="/photos/');
								photo_by_user = photo_by[1]
								photo_by_user = photo_by_user.split('>')[1];
								photo_by_author = photo_by_user.split('<');
								
								
								if (logged_in_user == photo_by_author[0]) {
								
									triple_array = Array(window.location.toString(), "attributionName", logged_in_user);
									add_triple(triple_array);
									triple_array = Array();
									
								}
						
						}
 						break;
		default: break;
	
	}
	
	if (license_found) {
		
		opera.extension.postMessage(Array("page_url",document.location.href))
		
		if(attribute_info.title==""){
			
			attribute_info.title = document.title;
			
		}
		
		opera.extension.postMessage(Array("show_button",attribute_info));
	
	}else{
		
		
		
	}
	
}

function listen(){

	opera.extension.onmessage = function(event){
		
		if (event.data[1] == document.location.href) {
		
			process_page();
			
		}
		
	};
	
}

window.addEventListener("load",listen,false);