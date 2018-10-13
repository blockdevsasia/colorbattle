<template>
  <div>
    <hr/>
    <chrome-picker :value="initialColor" @input="updateValue" :disable-alpha="true" :disable-fields="true" />
    <hr/>
    <button @click="play">Play! {{buttonString}}</button>
  </div>
</template>

<script>
import { Chrome } from 'vue-color'

export default {
  name: 'Main',
  mounted () {
    
  },
  data () {
    return {
      initialColor : { r: 255, g: 0, b: 0 },
      color : { r: 255, g: 0, b: 0 }
    }
  },
  components: {
      'chrome-picker': Chrome
  },
  methods: {
    updateValue (value) {
      // console.log("newcolor", value)
      this.color = value.rgba
    },
    play() {
      this.$store.dispatch('ethers/freeCredits')
    }
  },
  props: {
    msg: String
  },
  computed: {
    ethersState () {
      return  this.$store.state.ethers.connected
    },
    buttonString () {
      // if(this.color)
        return "Red: " + this.color.r + " Green: " + this.color.g + " Blue: " + this.color.b + " Total: " + this.total
    },
    total () {
      return this.color.r + this.color.g + this.color.b
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
