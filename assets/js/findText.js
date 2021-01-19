function searchText() {
  let searchBox = document.getElementById('searchBox');
  //Highlight the text to be searched for, otherwise display an error message
  //set aWrapAround to true
  if(window.find(searchBox.value, false, false, true)) {
  } else {
    window.alert('No text found matching the search')
  }
}
