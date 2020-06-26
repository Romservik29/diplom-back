const { db, storage, bucket } = require('../util/admin');
const config = require('../util/config');

exports.getTest = (req,res)=>{
    let test ={}
    db
    .collection('tests')
    .doc(req.params.testId)
    .get()
    .then(doc=>{
        test = doc.data()
        res.json(test)
    })
    .catch(err=>{
        console.error(err.code)
        res.status(500).json({error: "что-то пошло не так"+err.code, })
    })
}

exports.getResult = (req,res)=>{
    const userAnswers = req.body.answers;
    db
    .collection('tests')
    .doc(req.params.testId)
    .get(1)
    .then(doc=>{
        let correctAnswers =doc.data().correctAnswers;
        return culcResult(userAnswers,correctAnswers)
        
    })
    .then(results=>{
        res.json({result: results})
    })
    .catch(err=>{
        console.error(err)
    })
}

const culcResult = (userAnswer, correctAnswers)=>{
    let results ={};
    let correct = 0; 
    results.result =[];
    for(let key in userAnswer)
    {
        results.result.push(`${userAnswer[key]} === ${correctAnswers[key]}`)
        if(userAnswer[key]!==correctAnswers[key]){
        ++correct;
    }}
    results.grade = Math.round(correct/correctAnswers.length*10);
    return results;
}

exports.deleteTest = (req,res)=>{

}