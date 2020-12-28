export default function(project, media){
	let optimization = "desktop"
	if(g.mobile){
		optimization = "mobile";
	}
	return "./projects/"+ project.name +"/"+ (media.type.charAt(0).toUpperCase() + media.type.slice(1)) +"/"+ optimization +"/"+ media.src;
}