import React from 'react';
import {Container, Row, Button, Col} from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import FormModal from './FormModal.jsx';


export default class TableGrid extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          error: null,
          isLoaded: false,
          items: [],
          modalState: false,  // показать/скрыть модальную форму
          modalTitle: "Новая группа",
          editMode: false
      };
      this.handleModalHide = this.handleModalHide.bind(this);
      this.handleModalShow = this.handleModalShow.bind(this);
      this.onEditRecord = this.onEditRecord.bind(this);
    }

    componentDidMount() {
        fetch("https://sward.bsw.iron:4435/gm_getall")
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                isLoaded: true,
                items: result.data
              });
            },
            // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
            // чтобы не перехватывать исключения из ошибок в самих компонентах.
            (error) => {
              this.setState({
                isLoaded: true,
                error
              });
            }
          );
      }
    
    onEditRecord(event){
        
        this.setState({
            modalTitle: "Изменить группу",
            editMode: event.target.name,
            modalState: true
        });

        //console.log('Edit a: ' + event.target.name);
    }

    handleModalShow(){
        this.setState({modalState: true});
    }
    
    handleModalHide(){
        this.setState({modalState: false, editMode: false, modalTitle: "Новая группа"});
    }
    
    render(){
        const columns = [{
            dataField: 'dep_valid',
            text: 'Link',
            sort: true
           }, {
            dataField: '_id',
            text: 'Адрес группы',
            sort: true
          }, {
            dataField: 'group_name',
            text: 'Наименование',
            sort: true
          }, {
            dataField: 'dest',
            text: 'члены группы',
            sort: false,
            style: {fontSize: '12px'}
          },{
            dataField: 'df1',
            isDummyField: true,
            sort: false,
            text: 'actions',
            formatter: (cellContent, row) => {
              return (
                  <button className="btn btn-sm btn-secondary" onClick={this.onEditRecord} name={row._id}>Edt</button> 
              );
            }
          }
        ];
        const defaultSorted = [{
          dataField: '_id',
          order: 'asc'
        }]
        const selectRow = {
          mode: 'radio',
          clickToSelect: true,
          style: { backgroundColor: '#c8e6c9' }
        };

        const rowClasses = (row, rowIndex) => {
            if(!row.dep_valid){
                return 'alert-row-class';
            }
          };

        return(
            <Container>
                <Row>
                    <Col>
                      <h2>Групповая Почта</h2>
                    </Col>
                    <Col xs lg="2">
                      <Button 
                        variant="outline-success" 
                        
                        onClick={this.handleModalShow}>
                        Новая группа
                      </Button>
                    </Col>
                </Row>
                <FormModal 
                    show={this.state.modalState}
                    edit={this.state.editMode}
                    modalTitle={this.state.modalTitle} 
                    close={this.handleModalHide}/>
                <Row>
                  <BootstrapTable bootstrap4 keyField={"_id"} data={this.state.items} columns={columns} defaultSorted={defaultSorted} rowClasses={ rowClasses }/>
                </Row>
            </Container>
        )
    }
}  