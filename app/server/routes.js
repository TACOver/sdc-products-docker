const db = require('../db');

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.send('sdc-products');
    res.end();
  });

  app.get('/products', (req, res) => {
    const { page, count } = req.query;
    let pageOffset = 0;
    let SQL = 'SELECT * FROM products';
    // if (page) {
    //   if (!parseInt(page)) {
    //     res.status(422);
    //     res.end();
    //   } else {
    //     pageOffset = (parseInt(page) - 1) * 100;
    //   }
    // }
    if (count) {
      if (!parseInt(count)) {
        res.status(422);
        res.end();
      } else {
        SQL += ` LIMIT ${count}`;
      }
    } else {
      SQL += ' LIMIT 5';
    }
    db.query(SQL)
      .then( results => {
        res.status(200);
        res.send(results.rows);
        res.end();
      })
      .catch( err => {
        res.status(400);
        res.end();
        console.log('ERR /products:', err);
      });
  });
  
  app.get('/products/:productId', (req, res) => {
    const SQL = 
      `
        SELECT product_id, product_name, slogan, product_description, category, default_price,
        jsonb_agg (jsonb_build_object('name', features.feature_name, 'value', features.feature_value )) features
        FROM products 
        INNER JOIN features USING (product_id) 
        WHERE product_id=${req.params.productId}
        GROUP BY product_id
      `;
    db.query(SQL)
      .then( results => {
        res.status(200);
        res.send(results.rows);
        res.end();
      })
      .catch( err => {
        res.status(400);
        res.end();
        console.log('ERR /products/:productId:',err);
      });
  });
  
  app.get('/products/:productId/styles', (req, res) => {
    const SQL = 
      `
        SELECT styles.style_id, style_name, original_price, sale_price, isdefault,
        jsonb_agg (distinct jsonb_build_object('thumbnail_url',photos.thumbnail,'url',photos.url)) photos,
        jsonb_agg (distinct jsonb_build_object('sku_id',skus.sku_id,'size',skus.item_size,'quantity', skus.quantity)) skus
        FROM styles
        LEFT JOIN photos ON styles.style_id = photos.style_id
        LEFT JOIN skus ON styles.style_id = skus.style_id
        WHERE product_id=${req.params.productId}
        GROUP BY styles.style_id
      `;
    db.query(SQL)
      .then( results => {
        let styles = results.rows.slice()[0];
        let skus = styles.skus;
        styles.skus = {};
        skus.forEach(sku => {
          styles.skus[sku.sku_id] = {
            'size': sku.size,
            'quantity': sku.quantity,
          };
        })
        res.send([styles]);
        res.end();
      })
      .catch( err => {
        res.status(400);
        res.end();
        console.log('ERR /products/:productId/styles: ',err);
      });
  });
 
  app.get('/products/:productId/related', (req,res) => {
    const SQL = 
      `
        SELECT 
          array_agg(related_product_id)
        FROM
          related 
        WHERE product_id=${req.params.productId}
      `;
    db.query(SQL)
      .then( results => {
        res.send(results.rows[0].array_agg);
        res.end();
      })
      .catch( err => {
        res.status(400);
        res.end();
        console.log('ERR /products,/:productId/related: ',err);
      });
  });
};