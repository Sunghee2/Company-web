# 데이터베이스프로그래밍

##### Requirement

- 개발 언어 및 환경은 반드시 다음에 명시된 툴이나 환경을 사용하여야 함 (사용하지 않을 경우 감점)
- 데이터베이스 설계 도구: ERWin 사용 권장
- DBMS: 반드시 관계형 DBMS 사용 (오라클,  MariaDB, MySQL, PostgreSQL 등 사용 권장)
- 개발 프래임워크: 반드시 Git, Gibhub 사용, Java인 경우 Hibernate, JPA(Java Persistence API), Spring, MyBatis 등 사용 권장
- 프로그래밍 언어 등: JSP, JavaScript, jQuery 사용, Bootstrap 사용 권장 (Responsive Web 구현), Ruby, Node.js, React, PHP, Python 등 기타 프로그래밍 언어나 환경을 사용해도 무방함.
- UI는 주요 요구사항 중심으로 전체 프로젝트 중 일부분만을 구현하는 것을 권장함 (주의사항: 전체 시스템의 front-end를 다 상세하게 구현한다고 해서 점수를 더 받거나 하지 않는다는 점에 유의해서 시간과 리소스 분배를 잘할 것!)
- 생략된 UI가 있을 경우, 별도의 방법으로 Data를 import하여 최종 발표 시 주요 요구사항의 데모가 가능하도록 해야 함. 

​     

##### Schedule

| 순번 | 일자     | 내역                                          | 산출물                                                       |
| ---- | -------- | --------------------------------------------- | ------------------------------------------------------------ |
| 1    | 4/19(목) | 요구사항 분석 결과 및 프로젝트 진행 계획 발표 | 요구사항 정의서Entity-Relationship Diagram                   |
| 2    | 5/3(목)  | 데이터베이스 설계 결과 발표                   | 데이터베이스 정의서                                          |
| 3    | 5/17(목) | 프로젝트 중간점검 발표                        | CRUD Matrix표준용어/도메인/코드 정의서데이터베이스 생성 및 적재 스크립트 |
| 4    | 5/31(목) | 최종보고서 제출 및 프로젝트 시연              | 개발 언어/환경에 따른 전체 시스템 아키텍쳐 및 주요 개발 내용주요 화면 캡쳐 및 설명을 포함하는 최종보고서 |



##### settings

mysql 설정은 config/dbconfig.js에 있음. 최대한 아래에 맞춰서 설정하기.

```javascript
module.exports = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'company'
}
```

https://github.com/mysqljs/mysql



### 권민찬



### 배진영

- **18-05-12** 
  - view 추가 및 수정
    - 추가: includes/cards.pug, includes/main_image.pug, includes/records.pug, searches/search.pug
    - 수정: layout.pug, footer.pug, signin.pug, new.pug, stylesheets/style.css

- **18-05-16**
  - 추가: evaluations/client_evaluations.pug, evaluations/developer_evaluations.pug
  - 수정 완료: signin.pug, users/new.pug
  - 수정중: users/edit.pug, users/show.pug
  - 예정: employee_list, employee_detail page, admin_emp_insert_page, admin_project_insert_page
  
- **18-05-19**
  - 추가: searches/details/*




> 발표자료 만들어야 됨
> 
> 아오 css...
> 
> 나중에 폼 확인할 수 있게 router도 달아야하는데 귀찮다.. 달았음ㅇㅇ밑에서 url확인바람

###### 백엔드 합류(연기) -> 배진영


### 이성희

- **18-05-08** 
  - 추가 : async-error.js

- ##### 18-05-13

  - 인증 & 암호화
    - 추가 : lib/passport-config.js, routes/auth.js 
  - 회원가입
    - 추가: '/new'.get.post(routes/users.js)
  - 계정 정보수정
    - 추가
      - '/:id/edit'.get(routes/users.js)
      - '/:id'.put(routes/users.js) 
  - 수정: '/'.get(routes/index.js)

- ##### 18-05-14
  - 회원가입 form 변경
  - 로그인 버그 수정
  - 프로필 정보 수정
  - 비밀번호 수정

- ##### 18-05-15
  - 수정 : employees/index.pug, projects/index.pug

- ##### 18-05-17
  - 추가 : routes/evaluations.js
  - 수정 : app.js(router 추가), users/new.pug(value수정, placeholder로 변경), evaluations/client_evaluation_form.pug(name 수정/ projects들어왔을 경우 추가), evaluations/peer_evaluation_form.pug(name 수정/ projects들어왔을 경우 추가), includes/topnav.pug(pm url 변경)

> user/new 왜 다 value로 되어있는지 의문??? > 그래서 내가 걍 고쳤는데 혹시 따로 이유가 있으면 말해주셈
> 평가도 다 그러네 왜그런거임?
>
> 그리고 평가 get할 때 다 해당 user의 projects data 같이 보냄 dropdown에서 처리해주셈
> 평가 전체 페이지 하나 만들어서 들어가는 건지 아니면 따로 따로 topnav에 넣을 건지 답 좀 --> 페이지 생각중

- ##### 18-05-18
  - 수정 : signin.pug, users/new.pug(부서 data 맞게 넣음), users/edit.pug(해당하는 부서 data 넣고 선택 수정), includes/topnav.pug(계정id 보이도록 수정), lib/passport-config.js(session 수정), app.js(body-parser 추가), routes/evaluations.js(validate~수정), routes/users.js(정보수정할 때 부서정보 넘김)

- ##### 18-05-21
  - 수정 : employees/index.pug(검색 & 정보 줄임), projects/index.pug(검색), routes/employees.js(직원 검색), routes/projects.js(검색)

### 정지우

