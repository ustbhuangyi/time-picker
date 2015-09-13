# timePicker
a time picker which experience like IOS and it's inspired by the UIDatePicker.

## Usage ##

this time picker only for **mobile** web app. 
you can choose time after current time,  but if you want to choose time before current,  fork this repo and do whatever you want.

 It's very easy to use, here is an example.

```html
<div id="date" class="date"></div>
```
```javascript
$('#date').timePicker({
    delay: 15, //current time delay 15 minutes
    day: { 
      step: 1, // day step length
      len: 7, // day length
      filter: ['今天', '明天', '后天'], //for display 
      format: 'M月d日' //format date
    },
    hour: { 
      step: 1, // hour step length
      min: 0,  //min hour
      max: 23  //max hour
    },
    minute: {
      step: 10, // minute step length
      min: 0,  // min minute
      max: 50  // max minute
    }，
    placeHolder: '请选择日期'
  }).on('date.confirm', function (e, data) {
      console.log(data.text);  //get date text
      console.log(data.val);   //get date value
  });
});
```
Usually，these config are enough,  other config are related to experience, you don't need to change them.  but if you are not satisfied with the experience or the styles, extend the default options or fork it and DIY.

## Build ##

clone this repo
```bash
git clone https://github.com/ustbhuangyi/time-picker.git
```
install the dependence
```bash
cd time-picker
npm install
```
use gulp to build
```bash
gulp
```
run it 
```bash
gulp serve
```
visit this page via your mobile phone.

> your ip address:9000