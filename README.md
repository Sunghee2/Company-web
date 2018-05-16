## CHECK

- [x] Form name 최대한 column 이름과 동일하게 하기.
- [x] Form name README.md에 명시하기.
- [x] 각자 한 부분 적기(하단에 이름 적어둠).
- [x] indentation 지키기. 최대한 깔끔하게.



**또 추가해야 할 것 있으면 알아서 추가하기**



## 해야할 것

- [x] DB schema 생성 & query 최적화             
- [x] data 만들기



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

###### 상세 내용, 클레스명 확인 및 수정(해야하는데... 아직 데이터베이스 insert문..) -> 권민찬

- **18-05-16**
  - view 추가 및 수정
    - 추가: evaluation forms
    - 수정: refer to follow
    
  + (clear) signup -> department는 dropitem으로, 평가 페이지(PM, peer, client)
  + (clear) signup -> password (*), signin -> signup button 
  + search/employees, projects -> button
  + 직원리스트, 직원 상세 페이지(경영진)
  + 직원 정보 조회, 직원 정보 수정(edit) -> ing
  + 개발자 emp 입력페이지, project 입력페이지

> 보고서(with. 권민찬)
>
> 발표자료 만들어야 됨
>
> 나중에 폼 확인할 수 있게 router도 달아야하는데 귀찮다..

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

> search url...? 어디에 들어가는 건지....
>
> user 정보 수정 / 정보 보기 해야되나..

### 정지우

