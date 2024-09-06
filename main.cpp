#include <string>
#include <iostream>
#include <fstream>
using namespace std;

/*
void handleFileOpenFailure
string filename - the file name of the that had the open failure

This function handles the error messaging for a file open failure for the
the <filename> and displays a message with the following format:

File <filename> could not be opened !
Press the enter key to continue ...

This function pauses the screen so that the end user sees the error memssage.
The function then exits the program when the user responds.
*/

void handleFileOpenFailure(string filename) {
    cout << "File " << filename << " could not be opened.";
    cout << "Press enter once or twice to close the file...";
    cin.ignore(); cin.get();
    exit(EXIT_FAILURE);
}
/*
ReadInStudentNamesTo
Parameters:
string   studentNames[]       - the array to be filled with the student names by this function used by calling main
string   studentNamesFilename - The file that the student names are read from
unsigned &noStudents          - The number of students read in from the file used by calling main()

This function uses handleFileOpenFailure(string filename) to handle file open failures.

This function uses streams to fill the names array and closes the file stream when done.
The function uses to handle file open errors.
*/

void ReadInStudentNamesTo(string studentNames[], string studentNamesFilename, unsigned &noStudents) {
    ifstream studentNamesFileStream(studentNamesFilename);
    
    if (!studentNamesFileStream.is_open()) {
        handleFileOpenFailure(studentNamesFilename);
    }

    string inNameStr;
    noStudents = 0;
    while (getline(studentNamesFileStream, inNameStr)) {
        if (inNameStr != "") {
            studentNames[noStudents] = inNameStr;
            noStudents++;
        }
    }
}

/*
ReadInFileLinesTo
Parameter
char   dataArray[] - The data array to be filled at each element by a line entry in the file
string filenameStr - The file name used to get the information

This function uses handleFileOpenFailure(string filename) to handle file open failures.

This function reads in each line entry from the file into an element in the data array
*/

void ReadInFileLinesTo(char dataArray[], string filenameStr) {
    ifstream fileStream(filenameStr);

    if (!fileStream.is_open()) {
        handleFileOpenFailure(filenameStr);
    }
    unsigned lineNo = 0;

    while (fileStream >> dataArray[lineNo]) {
        ++lineNo;
    }
    fileStream.close();
}

/*
string ProcessCreateReportStringFor
unsigned studentNo          - the currect student no used to create the report string
unsigned maximumNoQuestions - the number of questions in the test,
                              this is how many answers are accessed in the student answers array
unsigned studentQuestionNo  - the starting question number to use for accessing the student answers array
string   studentNames[]     - the current student name for the inputted student number
char     studentAnswers[]   - contains a ll the answers for all the students
                              contains the sets of size maximumNoQuestions to use for the current input student number
char correctAnswers[]       - contain s the correct answers for the test

This function uses handleFileOpenFailure(string filename) to handle file open failures.

This function builds a report strring for the student number that is passed in by the calling function.
The report string is returned by function name to the calling programs.
*/
string ProcessCreateReportStringFor(unsigned studentNo, unsigned maximumNoQuestions, unsigned studentQuestionNo,
    string   studentNames[], char     studentAnswers[], char correctAnswers[]) {
    ifstream Name("StudentNames.txt");
    ifstream studentChoice("StudentAnswers.txt");
    unsigned noCorrect = 0;
    string incorrectStr = "";
    string studentStr;
    char studentAnswer;

    for (unsigned questionNo = 0;
        questionNo < maximumNoQuestions; ++questionNo, ++studentQuestionNo) {
        if (correctAnswers[questionNo] == studentAnswers[questionNo]) {
            noCorrect++;
        }
        else {
            incorrectStr += to_string(questionNo + 1) + " (" +
                string(1, studentAnswers[studentQuestionNo]) + "/" +
                string(1, correctAnswers[questionNo]) +
                ") ";
        }
    }

    if (incorrectStr == "")
        incorrectStr = "None";

    int percentScore = (int)(((float)noCorrect / maximumNoQuestions) * 100);

    string reportStr =
        "Student Number    : " + to_string(studentNo + 1) + "\n" +
        "Student Name      : " + studentNames[studentNo] + "\n" +
        "Amount Correct    : " + to_string(noCorrect) + "\n" +
        "Percent Score     : " + to_string(percentScore) + "\n" +
        "Incorrect Answers : " + incorrectStr + "\n";

    reportStr = reportStr + "Student " + ((percentScore > 69) ? "passed" : "failed") + ".\n\n";
    return (reportStr);

}

int main() {

    const string STUDENT_NAMES_FILENAME = "StudentNames.txt";
    const string CORRECT_ANSWERS_FILENAME = "CorrectAnswers.txt";
    const string STUDENT_ANSWERS_FILENAME = "StudentAnswers.txt";
    const string STUDENT_REPORT_FILENAME = "StudentReport.txt";

    const unsigned MAXIMUM_NUMBER_OF_STUDENTS = 10;
    string   studentNames[MAXIMUM_NUMBER_OF_STUDENTS];
    unsigned noStudents;

    const unsigned MAXIMUM_NUMBER_OF_QUESTIONS = 10;
    char     correctAnswers[MAXIMUM_NUMBER_OF_STUDENTS];
    char     studentAnswers[MAXIMUM_NUMBER_OF_STUDENTS * MAXIMUM_NUMBER_OF_QUESTIONS];
    //can use variables for the array size bc of constants
    ofstream reportFileStream(STUDENT_REPORT_FILENAME);
    if (reportFileStream.fail())
        handleFileOpenFailure(STUDENT_REPORT_FILENAME);

    ReadInStudentNamesTo(studentNames, STUDENT_NAMES_FILENAME, noStudents);
    ReadInFileLinesTo(correctAnswers, CORRECT_ANSWERS_FILENAME);
    ReadInFileLinesTo(studentAnswers, STUDENT_ANSWERS_FILENAME);

    string studentReportStr;
    for (unsigned studentNo = 0, studentQuestionNo = 0;
        studentNo < noStudents;
        ++studentNo, studentQuestionNo = studentQuestionNo + MAXIMUM_NUMBER_OF_QUESTIONS) {
        studentReportStr = ProcessCreateReportStringFor(studentNo, MAXIMUM_NUMBER_OF_QUESTIONS, studentQuestionNo,
            studentNames, studentAnswers, correctAnswers);
        cout << studentReportStr << endl;
        reportFileStream << studentReportStr << endl;
    }
    reportFileStream.close();
}



