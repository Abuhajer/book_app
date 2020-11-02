DROP TABLE IF EXISTS Books;


CREATE  TABLE Books (
id serial primary key ,
author varchar(200),
title  varchar(1000),
isbn varchar(100),
image_url varchar(500),
description varchar(5000),
categories  varchar(100)
);