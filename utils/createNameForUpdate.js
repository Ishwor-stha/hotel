module.exports.createNameUpdate=(firstName,middleName,lastName,dbName){

	if(firstName !==undefined && middleName.trim() !== undefined && lastName !== undefined){
		return `${firstName} ${middleName} ${lastName}`

	}
	if(firstName.trim()=== undefined  && middleName.trim() && lastName==undefined){
		return `${dbName[0]} ${middleName} ${dbName[2]}`
	}

}
