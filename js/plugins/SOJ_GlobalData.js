const sojDataFile = "data.soj";

DataManager.getSojData = function() {
  if (this.readFromFile(sojDataFile) === 0) {this.writeToSojFile({"title": 0})};
  var string = this.readFromFile(sojDataFile);
  const oneLoader = typeof $modLoader !== "undefined";
  if (oneLoader) {
    string = this.Decrypt(string);
  };
  return JSON.parse(string);
};

DataManager.writeToSojFile = function(oldData) {
  const oneLoader = typeof $modLoader !== "undefined";
  file = JSON.stringify(oldData);
  if (oneLoader) {
    file = this.Encrypt(file)
  };
  this.writeToFile(file,sojDataFile);
};

DataManager.setTitle = function(title) {
  var oldData = this.getSojData();
  oldData.title = title;
  this.writeToSojFile(oldData);
};

DataManager.setAnyData = function(key,val) {
    var oldData = this.getSojData();
    oldData[key] = val;
    this.writeToSojFile(oldData);
};

DataManager.Cipher = function(string,num) {
  length = string.length
  ciphered = ""
  for (var i = 0; i < length; i++) {
    char = string[i]
    oldUnicode = string.charCodeAt(i)
    if (oldUnicode < 123 && oldUnicode > 96) {
      newUnicode = oldUnicode + num

      if (newUnicode > 122) {
          
        while (newUnicode > 122) {
          temp = newUnicode-122 
          newUnicode = 96+temp
        }

      }

      if (newUnicode < 97) {

        while (newUnicode < 97) {
          newUnicode += 26
        }

      }

    } else if (oldUnicode < 91 && oldUnicode > 64) {
      newUnicode = oldUnicode + num

      if (newUnicode > 90) {
          
        while (newUnicode > 90) {
          temp = newUnicode-90 
          newUnicode = 64+temp
        }

      }

      if (newUnicode < 65) {

        while (newUnicode < 65) {
          newUnicode += 26
        }

      }

    } else {
      newUnicode = oldUnicode
    }
    //console.log(String.fromCharCode(newUnicode))
    ciphered += String.fromCharCode(newUnicode)
  }

  
  return ciphered
  //console.log(ciphered)


}

DataManager.Encrypt = function(object) {
  encodedObjectString = encodeURIComponent(object)
  //console.log(encodedObjectString)
  doubleEncodedObjectString = this.Cipher(encodedObjectString,7)
  return doubleEncodedObjectString
}

DataManager.Decrypt = function(object) {
  //console.log(encodedObjectString)
  objectString = this.Cipher(object,-7)
  decoded = decodeURIComponent(objectString)
  return decoded
}