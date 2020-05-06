// davm == Date and value module 😜;
// jshint esversion:8

 exports.getDate = function(){
   // Date() function is used to fetch today date according to local date
   const todayDate = new Date();
   // option object is used for some date dependent functions.
   const option = {
     weekday: "long",
     day: "numeric",
     month: "long",
     year: "numeric"
   };

   // toLocaleDateString() function is used to send date in some format.
   // "en-US is used for define the format of locality (en-US == english-United state)"
   // in this function option object is used to send the date data and en-US define the format.
   return todayDate.toLocaleDateString("en-US", option);
 };

 exports.getDay = () => {
   const todayDate = new Date();
   const option = {
     weekday: "long",
   };
   return todayDate.toLocaleDateString("en-US", option);
 };


 // this function checks value according to the input value
 exports.checkValue = (item) => {
   let count = 0;
   const size = item.length;
   for (let i = 0; i < size; i++) {
     if (item[i] == " ") {
       count = count + 1;
     }
   }
   return Boolean(size == count);
 };
