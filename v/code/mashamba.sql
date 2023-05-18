select 
    document.id as document, 
    category.name as category,
    json_arrayagg(json_object('num', page.num, 'url', image.url, 'name', image.name)) as pages
from 
    document
    inner join category on document.category=category.category
    inner join page on page.document= document.document
    inner join image on page.image = image.image
where not image.url=''
group by
    document, category;