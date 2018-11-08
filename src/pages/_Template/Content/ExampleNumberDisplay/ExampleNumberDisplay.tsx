import * as React from 'react'
import Chip from '@material-ui/core/Chip'

interface IProps {
  number: number
}
interface IState {
  isLucky: boolean
}
export class ExampleNumberDisplay extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props)
    // initial state
    this.state = { isLucky: false }
  }

  // updating props will not trigger constructor call and state set, so
  // if that is required you can use componentWillReceiveProps to trigger
  // state changes on prop changes
  public componentWillReceiveProps(nextProps: IProps) {
    this.setState({ isLucky: this.isItLucky(nextProps.number) })
  }

  public isItLucky(n: number) {
    return n % 3 === 0 ? true : false
  }

  public render() {
    return (
      <div>
        <span>The magic number is </span>
        <Chip
          label={this.props.number}
          color={this.state.isLucky ? 'primary' : 'secondary'}
        />
      </div>
    )
  }
}

/*************************************************************************************  
General Q & A

Q. What goes in a page's content folder
Components specific to the page go here. If it is likely to be used across multiple
pages then consider putting in the common folder. If it is more of a base building
block consider the src/components folder.

Q. How do I make use of props and state?
Props are passed from a parent, so might include data from the global state
Local state should contain things which aren't necessarily passed between components
but influence the visual design of the current component

Q. How do I apply styles
(*** to be specified ***)

Q. Are there any reusable components I can include in this template?
Yes, the material-ui library is imported and provides lots of components
(see https://material-ui.com for full list, when importing should be done 
  individually to enable treeshaking and not pulling in full list)
There are also base components in src/components and common page components  

Q. When should I export as a class and when should I export as default
This template exports the class and so when imported it will import an object that
matches the class name exactly. This is most useful if the class name is unique.
If however the name is unlikely to be unique/clearly identifying or the export needs
to be wrapped in something else (e.g. export withRouter(MyComponent)) then
export default will be most useful and the import will be named however desired. 

Anything else you want to know? Add it to a git issue and so we can make the 
template even more useful

**************************************************************************************/