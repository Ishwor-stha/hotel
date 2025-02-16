const {capitalizeFirstLetter}=require("./capitilizeFirstLetter");
module.exports.createFullName=(firstName,middleName,lastName)=>{
	if(!middleName)return `${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName)}`;
	else return  `${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(middleName)} ${capitalizeFirstLetter(lastName)}`;
	

}
// module.exports={createFullName}