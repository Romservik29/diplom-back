const notEmptyField ='Поле не должно быть пустым';

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
  };
  
  const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
  };
  
  exports.validateSignupData = (data) => {
    let errors = {};
    if(isEmpty(data.secondName)) errors.secondName =notEmptyField;
    if(isEmpty(data.name)) errors.name = notEmptyField;
    if (isEmpty(data.email)) {
      errors.email = notEmptyField;
    } else if (!isEmail(data.email)) {
      errors.email = 'Введите правильный email';
    }
  
    if (isEmpty(data.password)) errors.password = notEmptyField;
    if (data.password !== data.confirmPassword)
      errors.confirmPassword = 'Пароли должны совподать';

    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
    };
  };
  
  exports.validateLoginData = (data) => {
    let errors = {};
    if (isEmpty(data.email)) errors.email = notEmptyField;
    if (isEmpty(data.password)) errors.password = notEmptyField;
  
    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
    };
  };
  
  exports.reduceUserDetails = (data) => {
    let userDetails = {};
  
    if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
    if (!isEmpty(data.website.trim())) {
      // https://website.com
      if (data.website.trim().substring(0, 4) !== 'http') {
        userDetails.website = `http://${data.website.trim()}`;
      } else userDetails.website = data.website;
    }
    if (!isEmpty(data.location.trim())) userDetails.location = data.location;
  
    return userDetails;
  };
  