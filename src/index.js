const imagesJsonPath = "../data/numberImages.json"
const selectNumberEl = document.getElementById("numbers")
const imagesDivEl = document.getElementById("imgs")
let imagesArray = []
let selectedImages = []
let selectedImagesObjectList = []

async function fetchData() {
  try {
    const response = await fetch(imagesJsonPath);
    const json = await response.json();
    imagesArray = handleImagesJson(json);
    console.log("images array",imagesArray)
  } catch (error) {
    console.error("Error fetching or parsing JSON:", error);
  }
}

function handleImagesJson(jsonObject){
  return Object.values(jsonObject.images)
}

// Call the async function
await fetchData()

// render images and dropdown menu from localStorage if present
console.log("page loaded")
let defaultValue
if (localStorage.getItem('defaultSelectedValue')){
  defaultValue = localStorage.getItem('defaultSelectedValue')
} else {
  defaultValue = getDefaultNumberOfImages()
  localStorage.setItem('defaultSelectedValue', defaultValue);
}

// render selected images from local storage if present
selectedImagesObjectList = getSelectedImagesFromLocalStorage()
console.log("image obj list",selectedImagesObjectList)

if (defaultValue){
  setDropdownSelectedValue(defaultValue)
  renderNImages(defaultValue) 
} else {
  console.log("NO DEFAULT VALUES")
}



// get default value of number of images
function getDefaultNumberOfImages(){
  return selectNumberEl.value;
}

selectNumberEl.addEventListener("change", function (){
  let selectedValue = this.value
  console.log(selectedValue)
  localStorage.setItem('defaultSelectedValue', selectedValue);
  selectedImagesObjectList = []
  selectedImages = []
  setSelectedImagesToLocalStorage(selectedImagesObjectList  )
  renderNImages(selectedValue)
})


// render n number of images in images div element
function renderNImages(n){
  imagesDivEl.innerHTML = ""
  let i = 0
  while (i < n){
    let img = imagesArray[i]
    let tempImgDivEl = document.createElement('div')
    tempImgDivEl.classList.add('numberDiv');
    let imgEl = document.createElement('img')
    imgEl.src = img["source"]
    imgEl.alt = img["name"]
    imgEl.id = img["name"]
    imgEl.style.width = '200px'
    imgEl.style.height = '200px'
    tempImgDivEl.appendChild(imgEl)
    imagesDivEl.appendChild(tempImgDivEl)
    i+=1

    // check if this image was previously selected
    let selected = false
    let ans = wasImageSelectedPreviously(img["name"])
    selected = ans[0]
    let imgSelectionNumber = ans[1]
    console.log("image present previously",ans)

    if (selected){
      handleImageClick(undefined, imgEl, imgSelectionNumber)
    }

  }
}

function setDropdownSelectedValue(val){
  selectNumberEl.value = val
}

function handleImageClick(event, targetEl, targetSelectionNumber){
  if (targetEl && targetSelectionNumber){
    console.log("img was previously selected")
    let clickedImage = targetEl
    if (clickedImage.tagName === 'IMG'){
      clickedImage.classList.toggle('selected');
      console.log("image is clicked")
  
      if (clickedImage.classList.contains('selected')) {
        console.log('Image selected. Do something.')
        addOverlayNumber(clickedImage, targetSelectionNumber)
      } else {
        console.log('Image deselected. Do something else.')
        removeOverlayNumber(clickedImage)
      }
    } else {
      console.log("image is not clicked")
    }

  } else {
    console.log("button click")
    let clickedImage = event.target

    if (clickedImage.tagName === 'IMG'){
      clickedImage.classList.toggle('selected');
      console.log("image is clicked")

      if (clickedImage.classList.contains('selected')) {
        console.log('Image selected. Do something.')
        addOverlayNumber(clickedImage)
      } else {
        console.log('Image deselected. Do something else.')
        removeOverlayNumber(clickedImage)
      }
    } else {
      console.log("image is not clicked")
    }
  }
}

function addOverlayNumber(image, selectedImageCount=0) {
  // Create a new div for the overlay number
  let overlayNumber = document.createElement('div');
  overlayNumber.classList.add('overlay-number');
  if (selectedImageCount !== 0){
    overlayNumber.textContent = selectedImageCount
  } else {
    overlayNumber.textContent = selectedImagesObjectList.length + 1;
  }

  // Append the overlay number to the image container
  image.parentNode.appendChild(overlayNumber);

  // Keep track of selected images
  selectedImages.push(image);

  console.log(image.id, overlayNumber.textContent, typeof image.id, typeof overlayNumber.textContent)

  // generate image object to store in localStorage if not present
  if (! wasImageSelectedPreviously(image.id)[0]){
    let imgObject = generateImageObject(image.id, overlayNumber.textContent)
    selectedImagesObjectList.push(imgObject)
    setSelectedImagesToLocalStorage(selectedImagesObjectList)
  }
  

  console.log(selectedImages, selectedImagesObjectList)
}

function removeOverlayNumber(image) {
  // Find and remove the overlay number associated with the image
  let overlayNumber = image.parentNode.querySelector('.overlay-number');
  if (overlayNumber) {
    overlayNumber.remove();
  }

  selectedImages = selectedImages.filter(function(item) {
    return item !== image
  })
  console.log("image array after remove image",selectedImages)

  selectedImagesObjectList = selectedImagesObjectList.filter(function(item) {
    return item["imageId"] !== image.id
  })
  console.log("image object array after remove image",selectedImagesObjectList)

  // Update the overlay numbers of remaining selected images
  for (let i =0; i < selectedImages.length; i++){
    let numberElement = selectedImages[i].parentNode.querySelector('.overlay-number');
    if (numberElement) {
      numberElement.textContent = i+1
      selectedImagesObjectList[i]["imageNumber"] = i+1
      // setSelectedImagesToLocalStorage(generateImageObject(selectedImages[i].id, numberElement.textContent))
    }
  }
  console.log(selectedImagesObjectList)
  
  setSelectedImagesToLocalStorage(selectedImagesObjectList)
  

  // console.log(selectedImages)

}

function generateImageObject(imageId, imageSelectedNumber){
  return {'imageId': imageId, 'imageNumber': imageSelectedNumber}
}

// function removeImageObjectFromLocalStorage(imgName){
//   let savedImgsObject = getSelectedImagesFromLocalStorage()
//   let imgObjectToDelete  
//   for (let i =0; i < savedImgsObject.length; i++){
//     if (savedImgsObject[i]["name"] !== imgName){
//       setSelectedImagesToLocalStorage(savedImgsObject[i])
//     }
//   }

// }

function setSelectedImagesToLocalStorage(imgsObjectList){
  // let savedImgsObject = getSelectedImagesFromLocalStorage()
  // savedImgsObject.push(imgsObj)
  console.log("images list to save in local storage",imgsObjectList)
  localStorage.setItem("selectedImagesList", JSON.stringify(imgsObjectList))
}

function getSelectedImagesFromLocalStorage(){
  let imgsList = JSON.parse(localStorage.getItem("selectedImagesList") || "[]")
  console.log("images list from local storage",imgsList)
  return imgsList
}

// function fetchImageUsingName(imageName){
//   for (let i=0; i < imagesArray.length; i++){
//     if (imagesArray[i]["name"] === imageName){
//       return imagesArray[i]
//     }
//   }
// }

function wasImageSelectedPreviously(imgName){
  for (let i=0; i < selectedImagesObjectList.length; i++){
    if (selectedImagesObjectList[i]["imageId"] === imgName){
      return [true, selectedImagesObjectList[i]["imageNumber"]]
    }
  }
  return [false, 0]
}

imagesDivEl.addEventListener("click", handleImageClick)