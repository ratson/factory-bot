import DefaultAdapter from './DefaultAdapter'

export default class BookshelfAdapter extends DefaultAdapter {
  save(doc, Model) {
    return doc.save(null, { method: 'insert' })
  }
}
